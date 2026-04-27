using FluentValidation;
using Jarvis.Application.InputModels.Auth;

namespace Jarvis.Application.Validators.Auth;

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
