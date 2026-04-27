namespace Jarvis.Core.Common;

public sealed class Error
{
    public string Code { get; }
    public string Message { get; }
    public ErrorType Type { get; }
    public IReadOnlyDictionary<string, string[]>? Details { get; }

    private Error(string code, string message, ErrorType type, IReadOnlyDictionary<string, string[]>? details = null)
    {
        Code = code;
        Message = message;
        Type = type;
        Details = details;
    }

    public static Error Validation(string code, string message, IReadOnlyDictionary<string, string[]>? details = null)
        => new(code, message, ErrorType.Validation, details);

    public static Error Conflict(string code, string message)
        => new(code, message, ErrorType.Conflict);

    public static Error NotFound(string code, string message)
        => new(code, message, ErrorType.NotFound);

    public static Error Unauthorized(string code, string message)
        => new(code, message, ErrorType.Unauthorized);

    public static Error Forbidden(string code, string message)
        => new(code, message, ErrorType.Forbidden);

    public static Error Failure(string code, string message)
        => new(code, message, ErrorType.Failure);
}
