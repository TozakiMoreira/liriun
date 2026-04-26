using System.Text.Json;
using Jarvis.Core.Exceptions;

namespace Jarvis.Api.Middlewares;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (DomainException ex)
        {
            await EscreverErro(context, ex.StatusCode, ex.ErrorCode, ex.Message, ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro não tratado em {Method} {Path}", context.Request.Method, context.Request.Path);
            await EscreverErro(context, 500, "ERRO_INTERNO", "Erro inesperado. Tente novamente.", ex);
        }
    }

    private Task EscreverErro(HttpContext context, int statusCode, string errorCode, string mensagem, Exception ex)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        object payload = _env.IsDevelopment()
            ? new
            {
                errorCode,
                mensagem,
                tipo = ex.GetType().FullName,
                detalhe = ex.Message,
                inner = ColetarInner(ex),
                stack = ex.StackTrace
            }
            : (object)new { errorCode, mensagem };

        string json = JsonSerializer.Serialize(payload, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        return context.Response.WriteAsync(json);
    }

    private static List<object> ColetarInner(Exception ex)
    {
        List<object> list = new();
        Exception? cur = ex.InnerException;
        while (cur != null)
        {
            list.Add(new { tipo = cur.GetType().FullName, detalhe = cur.Message });
            cur = cur.InnerException;
        }
        return list;
    }
}
