using Liriun.Application.ReadModels;
using Liriun.Core.Entities;
using Liriun.Core.Enums;

namespace Liriun.Application.ViewModels.Tarefas;

public sealed record TarefaCategoriaViewModel(Guid Id, string Nome);

public sealed record TarefaViewModel(
    Guid Id,
    string Nome,
    Prioridade Prioridade,
    StatusTarefa Status,
    DateTime DataPrazo,
    TimeSpan? HorarioFinal,
    string? Observacoes,
    TipoRecorrencia Recorrencia,
    int RecorrenciaQuantidade,
    DateTime CriadaEm,
    DateTime? ConcluidaEm,
    long TempoGastoSegundos,
    IReadOnlyList<TarefaCategoriaViewModel> Categorias)
{
    private static readonly TimeSpan FimDoDia = new(23, 59, 59);

    public static TarefaViewModel FromEntity(Tarefa tarefa, DateTime agora, string? tzId = null)
        => new(
            tarefa.Id,
            tarefa.Nome,
            tarefa.Prioridade,
            tarefa.StatusComputado(agora, tzId),
            tarefa.DataPrazo,
            tarefa.HorarioFinal,
            tarefa.Observacoes,
            tarefa.Recorrencia,
            tarefa.RecorrenciaQuantidade,
            tarefa.CriadaEm,
            tarefa.ConcluidaEm,
            tarefa.TempoGastoSegundos,
            tarefa.Categorias
                .Where(tc => tc.Categoria != null)
                .Select(tc => new TarefaCategoriaViewModel(tc.CategoriaId, tc.Categoria!.Nome))
                .ToList());

    public static TarefaViewModel FromReadModel(TarefaReadModel readModel, DateTime agora, string? tzId = null)
    {
        StatusTarefa statusComputado = readModel.Status;
        if (statusComputado != StatusTarefa.Concluida)
        {
            DateTime agoraLocal = Tarefa.ConverterParaFusoUsuario(agora, tzId);
            DateTime limite = readModel.DataPrazo.Date.Add(readModel.HorarioFinal ?? FimDoDia);
            if (agoraLocal > limite)
                statusComputado = StatusTarefa.Atrasada;
        }

        return new(
            readModel.Id,
            readModel.Nome,
            readModel.Prioridade,
            statusComputado,
            readModel.DataPrazo,
            readModel.HorarioFinal,
            readModel.Observacoes,
            readModel.Recorrencia,
            readModel.RecorrenciaQuantidade,
            readModel.CriadaEm,
            readModel.ConcluidaEm,
            readModel.TempoGastoSegundos,
            readModel.Categorias
                .Select(c => new TarefaCategoriaViewModel(c.Id, c.Nome))
                .ToList());
    }
}
