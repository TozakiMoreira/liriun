using FluentAssertions;
using Liriun.Api.Extensions;
using Liriun.Core.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Liriun.Api.Tests.Extensions;

public class ResultExtensionsTests
{
    [Fact]
    public void NonGeneric_Success_chama_callback()
    {
        Result r = Result.Success();
        OkResult ok = new();

        IActionResult result = r.ToActionResult(() => ok);

        result.Should().BeSameAs(ok);
    }

    [Fact]
    public void Generic_Success_passa_value_pro_callback()
    {
        Result<string> r = Result<string>.Success("oi");

        IActionResult result = r.ToActionResult(v => new OkObjectResult(v));

        OkObjectResult ok = result.Should().BeOfType<OkObjectResult>().Subject;
        ok.Value.Should().Be("oi");
    }

    [Theory]
    [InlineData(ErrorType.Validation, StatusCodes.Status400BadRequest)]
    [InlineData(ErrorType.Unauthorized, StatusCodes.Status401Unauthorized)]
    [InlineData(ErrorType.Forbidden, StatusCodes.Status403Forbidden)]
    [InlineData(ErrorType.NotFound, StatusCodes.Status404NotFound)]
    [InlineData(ErrorType.Conflict, StatusCodes.Status409Conflict)]
    [InlineData(ErrorType.Failure, StatusCodes.Status500InternalServerError)]
    public void Failure_mapeia_ErrorType_pra_statusCode(ErrorType tipo, int statusEsperado)
    {
        Error err = TipoParaError(tipo);
        Result r = Result.Failure(err);

        ObjectResult obj = (ObjectResult)r.ToActionResult(() => new OkResult());

        obj.StatusCode.Should().Be(statusEsperado);
        ProblemDetails problem = obj.Value.Should().BeOfType<ProblemDetails>().Subject;
        problem.Status.Should().Be(statusEsperado);
        problem.Title.Should().Be(err.Code);
        problem.Detail.Should().Be(err.Message);
        problem.Type.Should().Be($"https://liriun-api/erros/{err.Code}");
    }

    [Fact]
    public void Failure_com_Details_inclui_errors_em_Extensions()
    {
        Dictionary<string, string[]> det = new() { ["nome"] = new[] { "obrigatorio" } };
        Error err = Error.Validation("x.invalido", "msg", det);
        Result r = Result.Failure(err);

        ObjectResult obj = (ObjectResult)r.ToActionResult(() => new OkResult());
        ProblemDetails problem = (ProblemDetails)obj.Value!;

        problem.Extensions.Should().ContainKey("errors");
        problem.Extensions["errors"].Should().BeSameAs(det);
    }

    [Fact]
    public void Failure_sem_Details_nao_inclui_errors_em_Extensions()
    {
        Error err = Error.NotFound("x.nao-encontrado", "msg");
        Result r = Result.Failure(err);

        ObjectResult obj = (ObjectResult)r.ToActionResult(() => new OkResult());
        ProblemDetails problem = (ProblemDetails)obj.Value!;

        problem.Extensions.Should().NotContainKey("errors");
    }

    [Fact]
    public void Generic_Failure_nao_chama_callback_de_sucesso()
    {
        bool foiChamado = false;
        Result<int> r = Result<int>.Failure(Error.NotFound("x.nao-encontrado", "msg"));

        IActionResult result = r.ToActionResult(_ =>
        {
            foiChamado = true;
            return new OkResult();
        });

        foiChamado.Should().BeFalse();
        ((ObjectResult)result).StatusCode.Should().Be(404);
    }

    private static Error TipoParaError(ErrorType tipo) => tipo switch
    {
        ErrorType.Validation => Error.Validation("x.validacao", "msg"),
        ErrorType.Unauthorized => Error.Unauthorized("x.nao-autorizado", "msg"),
        ErrorType.Forbidden => Error.Forbidden("x.proibido", "msg"),
        ErrorType.NotFound => Error.NotFound("x.nao-encontrado", "msg"),
        ErrorType.Conflict => Error.Conflict("x.conflito", "msg"),
        ErrorType.Failure => Error.Failure("x.falha", "msg"),
        _ => throw new ArgumentOutOfRangeException(nameof(tipo))
    };
}
