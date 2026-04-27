using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ReadModels;
using Jarvis.Application.ReadRepositories;
using Jarvis.Application.ViewModels.Prazos;
using Jarvis.Core.Common;

namespace Jarvis.Application.UseCases.Prazos;

public class ListarPrazosUseCase
{
    private readonly IPrazoReadRepository _prazoRead;
    private readonly IUsuarioLogado _usuarioLogado;

    public ListarPrazosUseCase(IPrazoReadRepository prazoRead, IUsuarioLogado usuarioLogado)
    {
        _prazoRead = prazoRead;
        _usuarioLogado = usuarioLogado;
    }

    public async Task<Result<IReadOnlyList<PrazoViewModel>>> ExecuteAsync(CancellationToken ct)
    {
        IReadOnlyList<PrazoReadModel> lista = await _prazoRead.ListarPorUsuarioAsync(_usuarioLogado.Id, ct);
        IReadOnlyList<PrazoViewModel> viewModels = lista
            .Select(PrazoViewModel.FromReadModel)
            .ToList();
        return Result<IReadOnlyList<PrazoViewModel>>.Success(viewModels);
    }
}
