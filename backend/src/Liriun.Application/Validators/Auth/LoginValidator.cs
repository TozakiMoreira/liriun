using FluentValidation;
using Liriun.Application.InputModels.Auth;

namespace Liriun.Application.Validators.Auth;

public sealed class LoginValidator : AbstractValidator<LoginInput>
{
    public LoginValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email e obrigatorio");

        RuleFor(x => x.Senha)
            .NotEmpty().WithMessage("Senha e obrigatoria");
    }
}
