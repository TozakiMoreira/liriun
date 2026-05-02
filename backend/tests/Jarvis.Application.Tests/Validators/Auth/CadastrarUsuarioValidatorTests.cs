using FluentAssertions;
using FluentValidation.Results;
using Jarvis.Application.InputModels.Auth;
using Jarvis.Application.Validators.Auth;

namespace Jarvis.Application.Tests.Validators.Auth;

public class CadastrarUsuarioValidatorTests
{
    private readonly CadastrarUsuarioValidator _validator = new();

    private static CadastrarUsuarioInput Input(string senha)
        => new("Lucas", "lucas@ex.com", senha);

    [Fact]
    public void Senha_valida_passa()
    {
        ValidationResult r = _validator.Validate(Input("Senha123!"));
        r.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("abc")]
    [InlineData("1234567")]
    [InlineData("Aa1!")]
    public void Senha_curta_falha_minimo_8(string senha)
    {
        ValidationResult r = _validator.Validate(Input(senha));
        r.IsValid.Should().BeFalse();
        r.Errors.Should().Contain(e => e.PropertyName == "Senha"
            && e.ErrorMessage.Contains("8 caracteres"));
    }

    [Fact]
    public void Senha_sem_maiuscula_falha()
    {
        ValidationResult r = _validator.Validate(Input("senha123!"));
        r.IsValid.Should().BeFalse();
        r.Errors.Should().Contain(e => e.PropertyName == "Senha"
            && e.ErrorMessage.Contains("maiuscula"));
    }

    [Fact]
    public void Senha_sem_caractere_especial_falha()
    {
        ValidationResult r = _validator.Validate(Input("Senha1234"));
        r.IsValid.Should().BeFalse();
        r.Errors.Should().Contain(e => e.PropertyName == "Senha"
            && e.ErrorMessage.Contains("especial"));
    }

    [Fact]
    public void Senha_so_minusculas_acumula_3_erros()
    {
        ValidationResult r = _validator.Validate(Input("abcdefgh"));
        r.IsValid.Should().BeFalse();
        var senhaErrors = r.Errors.Where(e => e.PropertyName == "Senha").ToList();
        senhaErrors.Should().Contain(e => e.ErrorMessage.Contains("maiuscula"));
        senhaErrors.Should().Contain(e => e.ErrorMessage.Contains("especial"));
    }

    [Fact]
    public void Senha_vazia_falha_NotEmpty()
    {
        ValidationResult r = _validator.Validate(Input(""));
        r.IsValid.Should().BeFalse();
        r.Errors.Should().Contain(e => e.PropertyName == "Senha");
    }

    [Fact]
    public void Email_sem_arroba_falha()
    {
        ValidationResult r = _validator.Validate(new CadastrarUsuarioInput("Lucas", "invalido", "Senha123!"));
        r.IsValid.Should().BeFalse();
        r.Errors.Should().Contain(e => e.PropertyName == "Email");
    }

    [Fact]
    public void Nome_vazio_falha()
    {
        ValidationResult r = _validator.Validate(new CadastrarUsuarioInput("", "lucas@ex.com", "Senha123!"));
        r.IsValid.Should().BeFalse();
        r.Errors.Should().Contain(e => e.PropertyName == "Nome");
    }
}
