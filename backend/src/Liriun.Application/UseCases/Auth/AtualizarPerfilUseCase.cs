using FluentValidation;
using FluentValidation.Results;
using Liriun.Application.InputModels.Auth;
using Liriun.Application.Interfaces.Auth;
using Liriun.Application.ReadRepositories;
using Liriun.Application.ViewModels.Auth;
using Liriun.Core.Common;
using Liriun.Core.Entities;
using Liriun.Core.Errors;
using Liriun.Core.Interfaces.Repositories;

namespace Liriun.Application.UseCases.Auth;

public class AtualizarPerfilUseCase
{
    private readonly IUsuarioRepository _usuarios;
    private readonly IUsuarioReadRepository _usuarioRead;
    private readonly IUsuarioLogado _usuarioLogado;
    private readonly IValidator<AtualizarPerfilInput> _validator;

    public AtualizarPerfilUseCase(
        IUsuarioRepository usuarios,
        IUsuarioReadRepository usuarioRead,
        IUsuarioLogado usuarioLogado,
        IValidator<AtualizarPerfilInput> validator)
    {
        _usuarios = usuarios;
        _usuarioRead = usuarioRead;
        _usuarioLogado = usuarioLogado;
        _validator = validator;
    }

    public async Task<Result<PerfilViewModel>> ExecuteAsync(AtualizarPerfilInput input, CancellationToken ct)
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

        string emailNormalizado = input.Email.Trim().ToLowerInvariant();
        if (emailNormalizado != usuario.Email
            && await _usuarioRead.ExisteEmailAsync(emailNormalizado, ct))
        {
            return Result<PerfilViewModel>.Failure(UsuarioErrors.EmailJaCadastrado());
        }

        Result atualizarResult = usuario.AtualizarPerfil(input.Nome, input.Email);
        if (atualizarResult.IsFailure)
            return Result<PerfilViewModel>.Failure(atualizarResult.Error!);

        await _usuarios.AtualizarAsync(usuario, ct);

        return Result<PerfilViewModel>.Success(new PerfilViewModel(usuario.Id, usuario.Nome, usuario.Email, usuario.FotoUrl));
    }
}
