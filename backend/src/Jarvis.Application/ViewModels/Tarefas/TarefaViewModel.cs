using Jarvis.Core.Entities;
using Jarvis.Core.Enums;

namespace Jarvis.Application.ViewModels.Tarefas;

public class TarefaCategoriaViewModel
{
    public Guid Id { get; init; }
    public string Nome { get; init; } = null!;
}

public class TarefaViewModel
{
    public Guid Id { get; init; }
    public string Nome { get; init; } = null!;
    public Prioridade Prioridade { get; init; }
    public StatusTarefa Status { get; init; }
    public Guid? PrazoId { get; init; }
    public DateTime? DataPrazo { get; init; }
    public TimeSpan HorarioFinal { get; init; }
    public DateTime CriadaEm { get; init; }
    public DateTime? ConcluidaEm { get; init; }
    public IReadOnlyList<TarefaCategoriaViewModel> Categorias { get; init; } = Array.Empty<TarefaCategoriaViewModel>();

    public static TarefaViewModel From(Tarefa tarefa, DateTime agora) => new()
    {
        Id = tarefa.Id,
        Nome = tarefa.Nome,
        Prioridade = tarefa.Prioridade,
        Status = tarefa.StatusComputado(agora),
        PrazoId = tarefa.PrazoId,
        DataPrazo = tarefa.DataPrazo,
        HorarioFinal = tarefa.HorarioFinal,
        CriadaEm = tarefa.CriadaEm,
        ConcluidaEm = tarefa.ConcluidaEm,
        Categorias = tarefa.Categorias
            .Where(tc => tc.Categoria != null)
            .Select(tc => new TarefaCategoriaViewModel { Id = tc.CategoriaId, Nome = tc.Categoria!.Nome })
            .ToList()
    };
}
