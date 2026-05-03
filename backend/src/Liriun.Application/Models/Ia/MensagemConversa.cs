namespace Liriun.Application.Models.Ia;

public enum PapelConversa
{
    Usuario = 1,
    Liriun = 2,
}

public sealed record MensagemConversa(PapelConversa Papel, string Texto);
