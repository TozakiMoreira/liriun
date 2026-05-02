using FluentValidation;
using FluentValidation.Results;
using Jarvis.Application.InputModels.Auth;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Core.Common;
using Jarvis.Core.Entities;
using Jarvis.Core.Errors;
using Jarvis.Core.Interfaces.Repositories;

namespace Jarvis.Application.UseCases.Auth;

public class AlterarSenhaUseCase
{
    private readonly IUsuarioRepository _usuarios;
    private readonly IPasswordHasher _hasher;
    private readonly IUsuarioLogado _usuarioLogado;
    private readonly IValidator<AlterarSenhaInput> _validator;

    public AlterarSenhaUseCase(
        IUsuarioRepository usuarios,
        IPasswordHasher hasher,
        IUsuarioLogado usuarioLogado,
        IValidator<AlterarSenhaInput> validator)
    {
        _usuarios = usuarios;
        _hasher = hasher;
        _usuarioLogado = usuarioLogado;
        _validator = validator;
    }

    public async Task<Result> ExecuteAsync(AlterarSenhaInput input, CancellationToken ct)
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

        if (!_hasher.Verificar(input.SenhaAtual, usuario.SenhaHash))
            return Result.Failure(UsuarioErrors.SenhaAtualIncorreta());

        string novoHash = _hasher.Hash(input.NovaSenha);
        Result alterarResult = usuario.AlterarSenha(novoHash);
        if (alterarResult.IsFailure)
            return alterarResult;

        await _usuarios.AtualizarAsync(usuario, ct);
        return Result.Success();
    }
}
