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

public class AtualizarFotoPerfilUseCase
{
    private readonly IUsuarioRepository _usuarios;
    private readonly IUsuarioLogado _usuarioLogado;
    private readonly IValidator<AtualizarFotoPerfilInput> _validator;

    public AtualizarFotoPerfilUseCase(
        IUsuarioRepository usuarios,
        IUsuarioLogado usuarioLogado,
        IValidator<AtualizarFotoPerfilInput> validator)
    {
        _usuarios = usuarios;
        _usuarioLogado = usuarioLogado;
        _validator = validator;
    }

    public async Task<Result<PerfilViewModel>> ExecuteAsync(AtualizarFotoPerfilInput input, CancellationToken ct)
    {
        ValidationResult validation = await _validator.ValidateAsync(input, ct);
        if (!validation.IsValid)
        {
            Dictionary<string, string[]> details = validation.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return Result<PerfilViewModel>.Failure(
                Error.Validation("usuario.validacao", "Dados invalidos", details));
        }

        Usuario? usuario = await _usuarios.ObterPorIdAsync(_usuarioLogado.Id, ct);
        if (usuario is null)
            return Result<PerfilViewModel>.Failure(UsuarioErrors.NaoEncontrado());

        Result atualizarResult = usuario.AtualizarFotoPerfil(input.FotoUrl);
        if (atualizarResult.IsFailure)
            return Result<PerfilViewModel>.Failure(atualizarResult.Error!);

        await _usuarios.AtualizarAsync(usuario, ct);

        return Result<PerfilViewModel>.Success(
            new PerfilViewModel(usuario.Id, usuario.Nome, usuario.Email, usuario.FotoUrl));
    }
}
