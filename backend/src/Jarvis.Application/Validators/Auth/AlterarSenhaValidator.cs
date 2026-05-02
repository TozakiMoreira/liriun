using FluentValidation;
using Jarvis.Application.InputModels.Auth;

namespace Jarvis.Application.Validators.Auth;

public sealed class AlterarSenhaValidator : AbstractValidator<AlterarSenhaInput>
{
    public AlterarSenhaValidator()
    {
        RuleFor(x => x.SenhaAtual)
            .NotEmpty().WithMessage("Informa a senha atual");

        RuleFor(x => x.NovaSenha).SenhaForte();

        RuleFor(x => x)
            .Must(x => x.NovaSenha != x.SenhaAtual)
            .When(x => !string.IsNullOrEmpty(x.NovaSenha) && !string.IsNullOrEmpty(x.SenhaAtual))
            .WithName("NovaSenha")
            .WithMessage("A nova senha precisa ser diferente da atual");
    }
}
