using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ViewModels.Tarefas;
using Jarvis.Core.Entities;
using Jarvis.Core.Interfaces.Repositories;

namespace Jarvis.Application.UseCases.Tarefas;

public class ListarTarefasConcluidasUseCase
{
    private readonly ITarefaRepository _tarefas;
    private readonly IUsuarioLogado _usuarioLogado;

    public ListarTarefasConcluidasUseCase(ITarefaRepository tarefas, IUsuarioLogado usuarioLogado)
    {
        _tarefas = tarefas;
        _usuarioLogado = usuarioLogado;
    }

    public async Task<IReadOnlyList<TarefaViewModel>> Executar(DateTime? de, DateTime? ate, CancellationToken ct = default)
    {
        DateTime agora = DateTime.UtcNow;
        IReadOnlyList<Tarefa> lista = await _tarefas.ListarConcluidas(_usuarioLogado.Id, de, ate, ct);
        return lista.Select(t => TarefaViewModel.From(t, agora)).ToList();
    }
}
