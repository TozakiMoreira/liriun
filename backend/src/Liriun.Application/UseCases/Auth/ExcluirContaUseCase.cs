using FluentValidation;
using FluentValidation.Results;
using Liriun.Application.InputModels.Auth;
using Liriun.Application.Interfaces.Auth;
using Liriun.Core.Common;
using Liriun.Core.Entities;
using Liriun.Core.Errors;
using Liriun.Core.Interfaces.Repositories;

namespace Liriun.Application.UseCases.Auth;

public class ExcluirContaUseCase
{
    private readonly IUsuarioRepository _usuarios;
    private readonly IPasswordHasher _hasher;
    private readonly IUsuarioLogado _usuarioLogado;
    private readonly IValidator<ExcluirContaInput> _validator;

    public ExcluirContaUseCase(
        IUsuarioRepository usuarios,
        IPasswordHasher hasher,
        IUsuarioLogado usuarioLogado,
        IValidator<ExcluirContaInput> validator)
    {
        _usuarios = usuarios;
        _hasher = hasher;
        _usuarioLogado = usuarioLogado;
        _validator = validator;
    }

    public async Task<Result> ExecuteAsync(ExcluirContaInput input, CancellationToken ct)
    {
        ValidationResult validation = await _validator.ValidateAsync(input, ct);
        if (!validation.IsValid)
        {
            Dictionary<string, string[]> details = validation.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return Result.Failure(
                Error.Validation("usuario.validacao", "Dados invalidos", details));
        }

        Usuario? usuario = await _usuarios.ObterPorIdAsync(_usuarioLogado.Id, ct);
        if (usuario is null)
            return Result.Failure(UsuarioErrors.NaoEncontrado());

        if (!_hasher.Verificar(input.Senha, usuario.SenhaHash))
            return Result.Failure(UsuarioErrors.SenhaAtualIncorreta());

        await _usuarios.RemoverAsync(usuario.Id, ct);
        return Result.Success();
    }
}
