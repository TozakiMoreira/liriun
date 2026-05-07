using Liriun.Core.Enums;

namespace Liriun.Application.InputModels.Tarefas;

public sealed record AtualizarTarefaInput(
    string Nome,
    Prioridade Prioridade,
    DateTime DataPrazo,
    IReadOnlyList<Guid>? CategoriaIds = null,
    TimeSpan? HorarioFinal = null,
    string? Observacoes = null,
    TipoRecorrencia Recorrencia = TipoRecorrencia.Nenhuma,
    int RecorrenciaQuantidade = 1);
