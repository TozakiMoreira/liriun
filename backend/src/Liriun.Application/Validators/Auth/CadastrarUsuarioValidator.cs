using FluentValidation;
using Liriun.Application.InputModels.Auth;

namespace Liriun.Application.Validators.Auth;

public sealed class CadastrarUsuarioValidator : AbstractValidator<CadastrarUsuarioInput>
{
    public CadastrarUsuarioValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome e obrigatorio")
            .MaximumLength(100).WithMessage("Nome nao pode passar de 100 caracteres");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email e obrigatorio")
            .MaximumLength(150).WithMessage("Email nao pode passar de 150 caracteres")
            .Must(e => e != null && e.Contains('@') && e.Contains('.')).WithMessage("Email em formato invalido");

        RuleFor(x => x.Senha).SenhaForte();

        RuleFor(x => x.CodigoBeta)
            .NotEmpty().WithMessage("Codigo beta e obrigatorio");

        RuleFor(x => x.AceitouTermos)
            .Equal(true).WithMessage("Voce precisa aceitar os Termos de Uso e a Politica de Privacidade");
    }
}
