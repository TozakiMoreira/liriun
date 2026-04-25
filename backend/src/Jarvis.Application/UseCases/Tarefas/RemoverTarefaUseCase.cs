using Jarvis.Application.Interfaces.Auth;
using Jarvis.Core.Entities;
using Jarvis.Core.Exceptions;
using Jarvis.Core.Interfaces.Repositories;

namespace Jarvis.Application.UseCases.Tarefas;

public class RemoverTarefaUseCase
{
    private readonly ITarefaRepository _tarefas;
    private readonly IUsuarioLogado _usuarioLogado;

    public RemoverTarefaUseCase(ITarefaRepository tarefas, IUsuarioLogado usuarioLogado)
    {
        _tarefas = tarefas;
        _usuarioLogado = usuarioLogado;
    }

    public async Task Executar(Guid id, CancellationToken ct = default)
    {
        Tarefa tarefa = await _tarefas.ObterPorId(id, _usuarioLogado.Id, ct)
            ?? throw new ApplicationLayerException("Tarefa não encontrada", 404);

        await _tarefas.Remover(tarefa, ct);
    }
}
