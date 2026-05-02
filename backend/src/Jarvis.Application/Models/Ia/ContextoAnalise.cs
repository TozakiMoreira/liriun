namespace Jarvis.Application.Models.Ia;

/// <summary>
/// Contexto enviado pra IA junto com o texto a analisar:
/// categorias do usuario (pra ela escolher) + data de hoje (pra resolver "amanha", "sexta", etc).
/// </summary>
public sealed record ContextoAnalise(
    string Texto,
    string NomeUsuario,
    DateTime HojeUtc,
    IReadOnlyList<CategoriaContexto> Categorias);

public sealed record CategoriaContexto(Guid Id, string Nome);
