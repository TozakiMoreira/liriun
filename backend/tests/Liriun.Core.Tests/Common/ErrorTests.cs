using FluentAssertions;
using Liriun.Core.Common;

namespace Liriun.Core.Tests.Common;

public class ErrorTests
{
    [Fact]
    public void Validation_define_tipo_e_preserva_code_e_mensagem()
    {
        Error e = Error.Validation("x.invalido", "X invalido");
        e.Code.Should().Be("x.invalido");
        e.Message.Should().Be("X invalido");
        e.Type.Should().Be(ErrorType.Validation);
        e.Details.Should().BeNull();
    }

    [Fact]
    public void Validation_aceita_Details()
    {
        Dictionary<string, string[]> det = new() { ["nome"] = new[] { "obrigatorio" } };
        Error e = Error.Validation("x.invalido", "msg", det);
        e.Details.Should().NotBeNull();
        e.Details!["nome"].Should().ContainSingle().Which.Should().Be("obrigatorio");
    }

    [Fact]
    public void Conflict_define_tipo_Conflict()
    {
        Error.Conflict("x.conflito", "msg").Type.Should().Be(ErrorType.Conflict);
    }

    [Fact]
    public void NotFound_define_tipo_NotFound()
    {
        Error.NotFound("x.nao-encontrado", "msg").Type.Should().Be(ErrorType.NotFound);
    }

    [Fact]
    public void Unauthorized_define_tipo_Unauthorized()
    {
        Error.Unauthorized("x.nao-autorizado", "msg").Type.Should().Be(ErrorType.Unauthorized);
    }

    [Fact]
    public void Forbidden_define_tipo_Forbidden()
    {
        Error.Forbidden("x.proibido", "msg").Type.Should().Be(ErrorType.Forbidden);
    }

    [Fact]
    public void Failure_define_tipo_Failure()
    {
        Error.Failure("x.falha", "msg").Type.Should().Be(ErrorType.Failure);
    }
}
