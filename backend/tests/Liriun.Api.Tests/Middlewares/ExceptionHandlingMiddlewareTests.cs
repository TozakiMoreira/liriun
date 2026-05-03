using System.Text.Json;
using FluentAssertions;
using Liriun.Api.Middlewares;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;

namespace Liriun.Api.Tests.Middlewares;

public class ExceptionHandlingMiddlewareTests
{
    private static (DefaultHttpContext ctx, MemoryStream body) NovoContexto()
    {
        DefaultHttpContext ctx = new();
        MemoryStream body = new();
        ctx.Response.Body = body;
        return (ctx, body);
    }

    private static ExceptionHandlingMiddleware Criar(RequestDelegate next)
        => new(next, NullLogger<ExceptionHandlingMiddleware>.Instance);

    private static async Task<JsonElement> LerCorpo(MemoryStream body)
    {
        body.Position = 0;
        using JsonDocument doc = await JsonDocument.ParseAsync(body);
        return doc.RootElement.Clone();
    }

    [Fact]
    public async Task Sem_excecao_passa_adiante_sem_alterar_status()
    {
        (DefaultHttpContext ctx, _) = NovoContexto();
        ctx.Response.StatusCode = 200;

        ExceptionHandlingMiddleware mw = Criar(_ => Task.CompletedTask);

        await mw.Invoke(ctx);

        ctx.Response.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task Excecao_responde_500_problemDetails()
    {
        (DefaultHttpContext ctx, MemoryStream body) = NovoContexto();
        ctx.TraceIdentifier = "trace-123";

        ExceptionHandlingMiddleware mw = Criar(_ => throw new InvalidOperationException("explodiu"));

        await mw.Invoke(ctx);

        ctx.Response.StatusCode.Should().Be(500);
        ctx.Response.ContentType.Should().Be("application/problem+json");

        JsonElement root = await LerCorpo(body);
        root.GetProperty("status").GetInt32().Should().Be(500);
        root.GetProperty("title").GetString().Should().Be("Erro interno");
        root.GetProperty("type").GetString().Should().Be("https://liriun-api/erros/interno");
        root.GetProperty("detail").GetString().Should().Contain("Erro inesperado");
        root.GetProperty("traceId").GetString().Should().Be("trace-123");
    }

    [Fact]
    public async Task Payload_nao_expoe_stack_nem_tipo_da_excecao()
    {
        (DefaultHttpContext ctx, MemoryStream body) = NovoContexto();

        ExceptionHandlingMiddleware mw = Criar(_ =>
            throw new InvalidOperationException("detalhe-cru-secreto"));

        await mw.Invoke(ctx);

        JsonElement root = await LerCorpo(body);
        root.TryGetProperty("stack", out _).Should().BeFalse();
        root.TryGetProperty("tipo", out _).Should().BeFalse();
        root.GetProperty("detail").GetString().Should().NotContain("detalhe-cru-secreto");
    }
}
