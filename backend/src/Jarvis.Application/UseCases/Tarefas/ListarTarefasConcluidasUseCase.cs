using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ReadModels;
using Jarvis.Application.ReadRepositories;
using Jarvis.Application.ViewModels.Tarefas;
using Jarvis.Core.Common;

namespace Jarvis.Application.UseCases.Tarefas;

public class ListarTarefasConcluidasUseCase
{
    private readonly ITarefaReadRepository _tarefaRead;
    private readonly IUsuarioLogado _usuarioLogado;

    public ListarTarefasConcluidasUseCase(ITarefaReadRepository tarefaRead, IUsuarioLogado usuarioLogado)
    {
        _tarefaRead = tarefaRead;
        _usuarioLogado = usuarioLogado;
    }

    public async Task<Result<IReadOnlyList<TarefaViewModel>>> ExecuteAsync(DateTime? de, DateTime? ate, CancellationToken ct)
    {
        DateTime agora = DateTime.UtcNow;
        IReadOnlyList<TarefaReadModel> lista = await _tarefaRead.ListarConcluidasAsync(_usuarioLogado.Id, de, ate, ct);
        IReadOnlyList<TarefaViewModel> viewModels = lista
            .Select(t => TarefaViewModel.FromReadModel(t, agora))
            .ToList();
        return Result<IReadOnlyList<TarefaViewModel>>.Success(viewModels);
    }
}
