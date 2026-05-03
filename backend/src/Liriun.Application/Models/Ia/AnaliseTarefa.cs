namespace Liriun.Application.Models.Ia;

/// <summary>
/// Tarefa estruturada extraida pela IA. Campos opcionais podem vir null
/// se o usuario nao mencionou.
/// </summary>
public sealed record AnaliseTarefa(
    string Titulo,
    IReadOnlyList<Guid> CategoriaIds,
    DateTime? DataPrazo,
    TimeSpan? HorarioFinal,
    int? Prioridade,
    string? Observacoes);
