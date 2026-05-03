using FluentValidation;
using Liriun.Application.InputModels.Auth;

namespace Liriun.Application.Validators.Auth;

public sealed class ExcluirContaValidator : AbstractValidator<ExcluirContaInput>
{
    public ExcluirContaValidator()
    {
        RuleFor(x => x.Senha)
            .NotEmpty().WithMessage("Confirma sua senha pra excluir a conta");
    }
}
