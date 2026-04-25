using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ViewModels.Tarefas;
using Jarvis.Core.Entities;
using Jarvis.Core.Interfaces.Repositories;

namespace Jarvis.Application.UseCases.Tarefas;

public class ListarTarefasPendentesUseCase
{
    private readonly ITarefaRepository _tarefas;
    private readonly IUsuarioLogado _usuarioLogado;

    public ListarTarefasPendentesUseCase(ITarefaRepository tarefas, IUsuarioLogado usuarioLogado)
    {
        _tarefas = tarefas;
        _usuarioLogado = usuarioLogado;
    }

    public async Task<IReadOnlyList<TarefaViewModel>> Executar(CancellationToken ct = default)
    {
        DateTime agora = DateTime.UtcNow;
        IReadOnlyList<Tarefa> lista = await _tarefas.ListarPendentes(_usuarioLogado.Id, ct);
        return lista.Select(t => TarefaViewModel.From(t, agora)).ToList();
    }
}
