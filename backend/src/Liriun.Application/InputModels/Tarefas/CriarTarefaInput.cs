using Liriun.Core.Enums;

namespace Liriun.Application.InputModels.Tarefas;

public sealed record CriarTarefaInput(
    string Nome,
    Prioridade Prioridade,
    DateTime DataPrazo,
    IReadOnlyList<Guid>? CategoriaIds = null,
    TimeSpan? HorarioFinal = null,
    string? Observacoes = null,
    TipoRecorrencia Recorrencia = TipoRecorrencia.Nenhuma);
