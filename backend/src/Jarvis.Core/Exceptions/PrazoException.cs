namespace Jarvis.Core.Exceptions;

public class PrazoException : DomainException
{
    public PrazoException(string message)
        : base(message, 400, "PRAZO_INVALIDO") { }
}
