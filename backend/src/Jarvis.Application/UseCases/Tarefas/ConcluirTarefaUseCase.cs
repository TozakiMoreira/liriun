using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ViewModels.Tarefas;
using Jarvis.Core.Entities;
using Jarvis.Core.Exceptions;
using Jarvis.Core.Interfaces.Repositories;

namespace Jarvis.Application.UseCases.Tarefas;

public class ConcluirTarefaUseCase
{
    private readonly ITarefaRepository _tarefas;
    private readonly IUsuarioLogado _usuarioLogado;

    public ConcluirTarefaUseCase(ITarefaRepository tarefas, IUsuarioLogado usuarioLogado)
    {
        _tarefas = tarefas;
        _usuarioLogado = usuarioLogado;
    }

    public async Task<TarefaViewModel> Executar(Guid id, CancellationToken ct = default)
    {
        Tarefa tarefa = await _tarefas.ObterPorId(id, _usuarioLogado.Id, ct)
            ?? throw new ApplicationLayerException("Tarefa não encontrada", 404);

        tarefa.Concluir();
        await _tarefas.Concluir(tarefa, ct);

        return TarefaViewModel.From(tarefa, DateTime.UtcNow);
    }
}
