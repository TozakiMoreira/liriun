namespace Jarvis.Core.Exceptions;

public class UsuarioException : DomainException
{
    public UsuarioException(string message)
        : base(message, 400, "USUARIO_INVALIDO") { }
}
