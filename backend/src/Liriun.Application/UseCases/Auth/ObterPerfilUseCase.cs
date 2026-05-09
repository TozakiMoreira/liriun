using Liriun.Application.Interfaces.Auth;
using Liriun.Application.ViewModels.Auth;
using Liriun.Core.Common;
using Liriun.Core.Entities;
using Liriun.Core.Errors;
using Liriun.Core.Interfaces.Repositories;

namespace Liriun.Application.UseCases.Auth;

public class ObterPerfilUseCase
{
    private readonly IUsuarioRepository _usuarios;
    private readonly IUsuarioLogado _usuarioLogado;

    public ObterPerfilUseCase(IUsuarioRepository usuarios, IUsuarioLogado usuarioLogado)
    {
        _usuarios = usuarios;
        _usuarioLogado = usuarioLogado;
    }

    public async Task<Result<PerfilViewModel>> ExecuteAsync(CancellationToken ct)
    {
        Usuario? usuario = await _usuarios.ObterPorIdAsync(_usuarioLogado.Id, ct);
        if (usuario is null)
            return Result<PerfilViewModel>.Failure(UsuarioErrors.NaoEncontrado());

        return Result<PerfilViewModel>.Success(new PerfilViewModel(
            usuario.Id, usuario.Nome, usuario.Email, usuario.FotoUrl));
    }
}
