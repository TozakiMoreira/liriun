using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro nao tratado em {Method} {Path}", context.Request.Method, context.Request.Path);

            ProblemDetails problem = new()
            {
                Type = "https://liriun-api/erros/interno",
                Title = "Erro interno",
                Status = StatusCodes.Status500InternalServerError,
                Detail = "Erro inesperado. Tente novamente."
            };

            problem.Extensions["traceId"] = context.TraceIdentifier;

            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/problem+json";

            string json = JsonSerializer.Serialize(problem, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            await context.Response.WriteAsync(json);
        }
    }
}
