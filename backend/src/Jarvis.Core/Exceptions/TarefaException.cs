namespace Jarvis.Core.Exceptions;

public class TarefaException : DomainException
{
    public TarefaException(string message)
        : base(message, 400, "TAREFA_INVALIDA") { }
}
