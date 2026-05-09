namespace Liriun.Application.Models.Ia;

public sealed record ContextoConversa(
    IReadOnlyList<MensagemConversa> Mensagens,
    string NomeUsuario,
    DateTime HojeUtc,
    IReadOnlyList<CategoriaContexto> Categorias,
    string Idioma = "pt");
