namespace Jarvis.Core.Exceptions;

public abstract class DomainException : Exception
{
    public int StatusCode { get; }
    public string ErrorCode { get; }

    protected DomainException(string message, int statusCode, string errorCode)
        : base(message)
    {
        StatusCode = statusCode;
        ErrorCode = errorCode;
    }
}
