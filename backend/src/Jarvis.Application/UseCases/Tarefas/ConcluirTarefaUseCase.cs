using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ViewModels.Tarefas;
using Jarvis.Core.Common;
using Jarvis.Core.Entities;
using Jarvis.Core.Errors;
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

    public async Task<Result<TarefaViewModel>> ExecuteAsync(Guid id, CancellationToken ct)
    {
        Tarefa? tarefa = await _tarefas.ObterPorIdAsync(id, _usuarioLogado.Id, ct);
        if (tarefa is null)
            return Result<TarefaViewModel>.Failure(TarefaErrors.NaoEncontrada());

        Result concluirResult = tarefa.Concluir();
        if (concluirResult.IsFailure)
            return Result<TarefaViewModel>.Failure(concluirResult.Error!);

        await _tarefas.AtualizarAsync(tarefa, tarefa.Categorias.Select(c => c.CategoriaId), ct);

        return Result<TarefaViewModel>.Success(TarefaViewModel.FromEntity(tarefa, DateTime.UtcNow));
    }
}
