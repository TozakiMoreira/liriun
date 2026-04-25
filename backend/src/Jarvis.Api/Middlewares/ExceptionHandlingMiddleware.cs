using System.Text.Json;
using Jarvis.Core.Exceptions;

namespace Jarvis.Api.Middlewares;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (DomainException ex)
        {
            await EscreverErro(context, ex.StatusCode, ex.ErrorCode, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro não tratado");
            await EscreverErro(context, 500, "ERRO_INTERNO", "Erro inesperado. Tente novamente.");
        }
    }

    private static Task EscreverErro(HttpContext context, int statusCode, string errorCode, string mensagem)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        string payload = JsonSerializer.Serialize(new
        {
            errorCode,
            mensagem
        }, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        return context.Response.WriteAsync(payload);
    }
}
