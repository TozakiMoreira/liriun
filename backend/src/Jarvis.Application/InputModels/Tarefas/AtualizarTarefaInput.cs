using Jarvis.Core.Enums;

namespace Jarvis.Application.InputModels.Tarefas;

public sealed record AtualizarTarefaInput(
    string Nome,
    Prioridade Prioridade,
    IReadOnlyList<Guid>? CategoriaIds = null,
    Guid? PrazoId = null,
    DateTime? DataPrazoCustom = null,
    TimeSpan? HorarioFinal = null);
