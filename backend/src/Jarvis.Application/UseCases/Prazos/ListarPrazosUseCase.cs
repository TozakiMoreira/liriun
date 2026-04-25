using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ViewModels.Prazos;
using Jarvis.Core.Entities;
using Jarvis.Core.Interfaces.Repositories;

namespace Jarvis.Application.UseCases.Prazos;

public class ListarPrazosUseCase
{
    private readonly IPrazoRepository _prazos;
    private readonly IUsuarioLogado _usuarioLogado;

    public ListarPrazosUseCase(IPrazoRepository prazos, IUsuarioLogado usuarioLogado)
    {
        _prazos = prazos;
        _usuarioLogado = usuarioLogado;
    }

    public async Task<IReadOnlyList<PrazoViewModel>> Executar(CancellationToken ct = default)
    {
        IReadOnlyList<Prazo> lista = await _prazos.ListarPorUsuario(_usuarioLogado.Id, ct);
        return lista.Select(PrazoViewModel.From).ToList();
    }
}
