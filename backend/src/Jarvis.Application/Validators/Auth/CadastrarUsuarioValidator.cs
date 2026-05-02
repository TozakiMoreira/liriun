using FluentValidation;
using Jarvis.Application.InputModels.Auth;

namespace Jarvis.Application.Validators.Auth;

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
    }
}
