using Jarvis.Core.Enums;

namespace Jarvis.Application.InputModels.Tarefas;

public sealed record AtualizarTarefaInput(
    string Nome,
    Prioridade Prioridade,
    DateTime DataPrazo,
    IReadOnlyList<Guid>? CategoriaIds = null,
    TimeSpan? HorarioFinal = null,
    string? Observacoes = null);
