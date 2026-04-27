using Jarvis.Application.Interfaces.Auth;
using Jarvis.Core.Common;
using Jarvis.Core.Entities;
using Jarvis.Core.Errors;
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

    public async Task<Result> ExecuteAsync(Guid id, CancellationToken ct)
    {
        Tarefa? tarefa = await _tarefas.ObterPorIdAsync(id, _usuarioLogado.Id, ct);
        if (tarefa is null)
            return Result.Failure(TarefaErrors.NaoEncontrada());

        await _tarefas.RemoverAsync(tarefa, ct);
        return Result.Success();
    }
}
