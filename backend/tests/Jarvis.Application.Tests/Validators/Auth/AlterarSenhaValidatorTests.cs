using FluentAssertions;
using FluentValidation.Results;
using Jarvis.Application.InputModels.Auth;
using Jarvis.Application.Validators.Auth;

namespace Jarvis.Application.Tests.Validators.Auth;

public class AlterarSenhaValidatorTests
{
    private readonly AlterarSenhaValidator _validator = new();

    [Fact]
    public void Valido_passa()
    {
        ValidationResult r = _validator.Validate(new AlterarSenhaInput("Atual123!", "Nova456@"));
        r.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Senha_atual_vazia_falha()
    {
        ValidationResult r = _validator.Validate(new AlterarSenhaInput("", "Nova456@"));
        r.IsValid.Should().BeFalse();
        r.Errors.Should().Contain(e => e.PropertyName == "SenhaAtual");
    }

    [Fact]
    public void Nova_senha_fraca_falha()
    {
        ValidationResult r = _validator.Validate(new AlterarSenhaInput("Atual123!", "fraca"));
        r.IsValid.Should().BeFalse();
        r.Errors.Should().Contain(e => e.PropertyName == "NovaSenha");
    }

    [Fact]
    public void Nova_senha_igual_atual_falha()
    {
        ValidationResult r = _validator.Validate(new AlterarSenhaInput("Senha123!", "Senha123!"));
        r.IsValid.Should().BeFalse();
        r.Errors.Should().Contain(e => e.PropertyName == "NovaSenha"
            && e.ErrorMessage.Contains("diferente"));
    }
}
