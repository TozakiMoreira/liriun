using FluentValidation;
using Jarvis.Application.InputModels.Prazos;

namespace Jarvis.Application.Validators.Prazos;

public sealed class CriarPrazoValidator : AbstractValidator<CriarPrazoInput>
{
    public CriarPrazoValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome do prazo e obrigatorio")
            .MaximumLength(50).WithMessage("Nome do prazo nao pode passar de 50 caracteres");

        RuleFor(x => x.DuracaoDias)
            .GreaterThanOrEqualTo(0).When(x => x.DuracaoDias.HasValue)
            .WithMessage("Duracao em dias nao pode ser negativa");
    }
}
