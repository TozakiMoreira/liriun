using FluentAssertions;
using Liriun.Core.Common;

namespace Liriun.Core.Tests.Common;

public class ResultTests
{
    [Fact]
    public void Success_marca_IsSuccess_e_zera_Error()
    {
        Result r = Result.Success();
        r.IsSuccess.Should().BeTrue();
        r.IsFailure.Should().BeFalse();
        r.Error.Should().BeNull();
    }

    [Fact]
    public void Failure_marca_IsFailure_e_preserva_Error()
    {
        Error err = Error.Validation("x.invalido", "X invalido");
        Result r = Result.Failure(err);
        r.IsSuccess.Should().BeFalse();
        r.IsFailure.Should().BeTrue();
        r.Error.Should().BeSameAs(err);
    }

    [Fact]
    public void Generic_Success_preserva_value()
    {
        Result<int> r = Result<int>.Success(42);
        r.IsSuccess.Should().BeTrue();
        r.Value.Should().Be(42);
        r.Error.Should().BeNull();
    }

    [Fact]
    public void Generic_Failure_zera_value_e_guarda_Error()
    {
        Error err = Error.NotFound("x.nao-encontrado", "nao achou");
        Result<string> r = Result<string>.Failure(err);
        r.IsFailure.Should().BeTrue();
        r.Value.Should().BeNull();
        r.Error.Should().BeSameAs(err);
    }

    [Fact]
    public void Generic_Success_aceita_value_null_quando_T_e_referencia()
    {
        Result<string?> r = Result<string?>.Success(null);
        r.IsSuccess.Should().BeTrue();
        r.Value.Should().BeNull();
    }
}
