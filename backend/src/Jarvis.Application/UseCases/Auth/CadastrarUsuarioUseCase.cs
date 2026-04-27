using FluentValidation;
using FluentValidation.Results;
using Jarvis.Application.InputModels.Auth;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ReadRepositories;
using Jarvis.Application.ViewModels.Auth;
using Jarvis.Core.Common;
using Jarvis.Core.Entities;
using Jarvis.Core.Errors;
using Jarvis.Core.Interfaces.Repositories;

namespace Jarvis.Application.UseCases.Auth;

public class CadastrarUsuarioUseCase
{
    private readonly IUsuarioRepository _usuarios;
    private readonly IUsuarioReadRepository _usuarioRead;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenService _jwt;
    private readonly IValidator<CadastrarUsuarioInput> _validator;

    public CadastrarUsuarioUseCase(
        IUsuarioRepository usuarios,
        IUsuarioReadRepository usuarioRead,
        IPasswordHasher hasher,
        IJwtTokenService jwt,
        IValidator<CadastrarUsuarioInput> validator)
    {
        _usuarios = usuarios;
        _usuarioRead = usuarioRead;
        _hasher = hasher;
        _jwt = jwt;
        _validator = validator;
    }

    public async Task<Result<AutenticacaoViewModel>> ExecuteAsync(CadastrarUsuarioInput input, CancellationToken ct)
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

        if (await _usuarioRead.ExisteEmailAsync(emailNormalizado, ct))
            return Result<AutenticacaoViewModel>.Failure(UsuarioErrors.EmailJaCadastrado());

        string senhaHash = _hasher.Hash(input.Senha);
        Result<Usuario> criacaoResult = Usuario.Criar(input.Nome, emailNormalizado, senhaHash);
        if (criacaoResult.IsFailure)
            return Result<AutenticacaoViewModel>.Failure(criacaoResult.Error!);

        Usuario usuario = await _usuarios.AdicionarAsync(criacaoResult.Value!, ct);

        (string token, DateTime expira) = _jwt.Gerar(usuario);

        return Result<AutenticacaoViewModel>.Success(
            new AutenticacaoViewModel(usuario.Id, usuario.Nome, usuario.Email, token, expira));
    }
}
