using FluentValidation;
using FluentValidation.Results;
using Liriun.Application.InputModels.Auth;
using Liriun.Application.Interfaces.Auth;
using Liriun.Application.ViewModels.Auth;
using Liriun.Core.Common;
using Liriun.Core.Entities;
using Liriun.Core.Errors;
using Liriun.Core.Interfaces.Repositories;

namespace Liriun.Application.UseCases.Auth;

public class LoginUseCase
{
    private readonly IUsuarioRepository _usuarios;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenService _jwt;
    private readonly IValidator<LoginInput> _validator;

    public LoginUseCase(
        IUsuarioRepository usuarios,
        IPasswordHasher hasher,
        IJwtTokenService jwt,
        IValidator<LoginInput> validator)
    {
        _usuarios = usuarios;
        _hasher = hasher;
        _jwt = jwt;
        _validator = validator;
    }

    public async Task<Result<AutenticacaoViewModel>> ExecuteAsync(LoginInput input, CancellationToken ct)
    {
        ValidationResult validation = await _validator.ValidateAsync(input, ct);
        if (!validation.IsValid)
        {
            Dictionary<string, string[]> details = validation.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return Result<AutenticacaoViewModel>.Failure(
                Error.Validation("usuario.validacao", "Dados invalidos", details));
        }

        string emailNormalizado = input.Email.Trim().ToLowerInvariant();
        Usuario? usuario = await _usuarios.ObterPorEmailAsync(emailNormalizado, ct);

        if (usuario is null || !_hasher.Verificar(input.Senha, usuario.SenhaHash))
            return Result<AutenticacaoViewModel>.Failure(UsuarioErrors.CredenciaisInvalidas());

        (string token, DateTime expira) = _jwt.Gerar(usuario);

        return Result<AutenticacaoViewModel>.Success(
            new AutenticacaoViewModel(usuario.Id, usuario.Nome, usuario.Email, usuario.FotoUrl, token, expira, usuario.EhAdmin));
    }
}
