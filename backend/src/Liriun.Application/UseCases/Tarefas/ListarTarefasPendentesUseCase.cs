using Liriun.Application.Interfaces.Auth;
using Liriun.Application.ReadModels;
using Liriun.Application.ReadRepositories;
using Liriun.Application.ViewModels.Tarefas;
using Liriun.Core.Common;

namespace Liriun.Application.UseCases.Tarefas;

public class ListarTarefasPendentesUseCase
{
    private readonly ITarefaReadRepository _tarefaRead;
    private readonly IUsuarioLogado _usuarioLogado;

    public ListarTarefasPendentesUseCase(ITarefaReadRepository tarefaRead, IUsuarioLogado usuarioLogado)
    {
        _tarefaRead = tarefaRead;
        _usuarioLogado = usuarioLogado;
    }

    public async Task<Result<IReadOnlyList<TarefaViewModel>>> ExecuteAsync(CancellationToken ct)
    {
        DateTime agora = DateTime.UtcNow;
        IReadOnlyList<TarefaReadModel> lista = await _tarefaRead.ListarPendentesAsync(_usuarioLogado.Id, ct);
        IReadOnlyList<TarefaViewModel> viewModels = lista
            .Select(t => TarefaViewModel.FromReadModel(t, agora))
            .ToList();
        return Result<IReadOnlyList<TarefaViewModel>>.Success(viewModels);
    }
}
