namespace Jarvis.Application.Models.Ia;

public enum PapelConversa
{
    Usuario = 1,
    Jarvis = 2,
}

public sealed record MensagemConversa(PapelConversa Papel, string Texto);
