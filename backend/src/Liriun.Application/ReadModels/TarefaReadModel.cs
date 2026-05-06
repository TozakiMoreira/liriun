using Liriun.Core.Enums;

namespace Liriun.Application.ReadModels;

public sealed record TarefaCategoriaReadModel(
    Guid Id,
    string Nome);

public sealed record TarefaReadModel(
    Guid Id,
    string Nome,
    Prioridade Prioridade,
    StatusTarefa Status,
    DateTime DataPrazo,
    TimeSpan? HorarioFinal,
    string? Observacoes,
    TipoRecorrencia Recorrencia,
    DateTime CriadaEm,
    DateTime? ConcluidaEm,
    IReadOnlyList<TarefaCategoriaReadModel> Categorias);
