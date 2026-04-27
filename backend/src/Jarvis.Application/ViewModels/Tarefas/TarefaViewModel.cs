using Jarvis.Application.ReadModels;
using Jarvis.Core.Entities;
using Jarvis.Core.Enums;

namespace Jarvis.Application.ViewModels.Tarefas;

public sealed record TarefaCategoriaViewModel(Guid Id, string Nome);

public sealed record TarefaViewModel(
    Guid Id,
    string Nome,
    Prioridade Prioridade,
    StatusTarefa Status,
    Guid? PrazoId,
    DateTime? DataPrazo,
    TimeSpan HorarioFinal,
    DateTime CriadaEm,
    DateTime? ConcluidaEm,
    IReadOnlyList<TarefaCategoriaViewModel> Categorias)
{
    public static TarefaViewModel FromEntity(Tarefa tarefa, DateTime agora)
        => new(
            tarefa.Id,
            tarefa.Nome,
            tarefa.Prioridade,
            tarefa.StatusComputado(agora),
            tarefa.PrazoId,
            tarefa.DataPrazo,
            tarefa.HorarioFinal,
            tarefa.CriadaEm,
            tarefa.ConcluidaEm,
            tarefa.Categorias
                .Where(tc => tc.Categoria != null)
                .Select(tc => new TarefaCategoriaViewModel(tc.CategoriaId, tc.Categoria!.Nome))
                .ToList());

    public static TarefaViewModel FromReadModel(TarefaReadModel readModel, DateTime agora)
    {
        StatusTarefa statusComputado = readModel.Status;
        if (statusComputado != StatusTarefa.Concluida && readModel.DataPrazo.HasValue)
        {
            DateTime limite = readModel.DataPrazo.Value.Add(readModel.HorarioFinal);
            if (agora > limite)
                statusComputado = StatusTarefa.Atrasada;
        }

        return new(
            readModel.Id,
            readModel.Nome,
            readModel.Prioridade,
            statusComputado,
            readModel.PrazoId,
            readModel.DataPrazo,
            readModel.HorarioFinal,
            readModel.CriadaEm,
            readModel.ConcluidaEm,
            readModel.Categorias
                .Select(c => new TarefaCategoriaViewModel(c.Id, c.Nome))
                .ToList());
    }
}
