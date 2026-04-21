namespace Jarvis.Core.Exceptions;

public class InfrastructureException : DomainException
{
    public InfrastructureException(string message)
        : base(message, 503, "FALHA_INFRAESTRUTURA") { }
}
