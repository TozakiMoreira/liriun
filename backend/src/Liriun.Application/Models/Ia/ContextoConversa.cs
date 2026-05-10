namespace Liriun.Application.Models.Ia;

public sealed record ContextoConversa(
    IReadOnlyList<MensagemConversa> Mensagens,
    string NomeUsuario,
    DateTime HojeUtc,
    IReadOnlyList<CategoriaContexto> Categorias,
    IReadOnlyList<TarefaContexto> TarefasPendentes,
    string Idioma = "pt");
