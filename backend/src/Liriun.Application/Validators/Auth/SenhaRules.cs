using FluentValidation;

namespace Liriun.Application.Validators.Auth;

public static class SenhaRules
{
    public static IRuleBuilderOptions<T, string> SenhaForte<T>(this IRuleBuilder<T, string> rule)
        => rule
            .NotEmpty().WithMessage("Senha e obrigatoria")
            .MinimumLength(8).WithMessage("A senha precisa ter ao menos 8 caracteres")
            .MaximumLength(100).WithMessage("Senha nao pode passar de 100 caracteres")
            .Matches("[A-Z]").WithMessage("A senha precisa ter ao menos 1 letra maiuscula")
            .Matches("[^A-Za-z0-9]").WithMessage("A senha precisa ter ao menos 1 caractere especial");
}
