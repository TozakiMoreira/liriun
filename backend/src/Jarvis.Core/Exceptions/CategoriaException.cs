namespace Jarvis.Core.Exceptions;

public class CategoriaException : DomainException
{
    public CategoriaException(string message)
        : base(message, 400, "CATEGORIA_INVALIDA") { }
}
