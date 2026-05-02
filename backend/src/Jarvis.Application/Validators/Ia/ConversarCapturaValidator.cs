using FluentValidation;
using Jarvis.Application.InputModels.Ia;

namespace Jarvis.Application.Validators.Ia;

public sealed class ConversarCapturaValidator : AbstractValidator<ConversarCapturaInput>
{
    public ConversarCapturaValidator()
    {
        RuleFor(x => x.Mensagens)
            .NotNull()
            .Must(m => m.Count > 0).WithMessage("Pelo menos uma mensagem e necessaria")
            .Must(m => m.Count <= 30).WithMessage("Conversa muito longa, recomece");

        RuleForEach(x => x.Mensagens).ChildRules(m =>
        {
            m.RuleFor(x => x.Texto)
                .NotEmpty().WithMessage("Mensagem nao pode ser vazia")
                .MaximumLength(2000).WithMessage("Mensagem nao pode passar de 2000 caracteres");

            m.RuleFor(x => x.Papel)
                .Must(p => p == "usuario" || p == "jarvis")
                .WithMessage("Papel deve ser 'usuario' ou 'jarvis'");
        });
    }
}
