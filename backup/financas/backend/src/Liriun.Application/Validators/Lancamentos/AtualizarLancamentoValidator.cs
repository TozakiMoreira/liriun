using FluentValidation;
using Liriun.Application.InputModels.Lancamentos;

namespace Liriun.Application.Validators.Lancamentos;

public sealed class AtualizarLancamentoValidator : AbstractValidator<AtualizarLancamentoInput>
{
    public AtualizarLancamentoValidator()
    {
        RuleFor(x => x.Descricao)
            .NotEmpty().WithMessage("Descricao e obrigatoria")
            .MaximumLength(200).WithMessage("Descricao nao pode passar de 200 caracteres");

        RuleFor(x => x.Valor)
            .GreaterThan(0).WithMessage("Valor deve ser maior que zero");

        RuleFor(x => x.DataReferencia)
            .NotEqual(default(DateTime)).WithMessage("Data e obrigatoria");

        RuleFor(x => x.Observacoes)
            .MaximumLength(2000).WithMessage("Observacoes nao pode passar de 2000 caracteres");
    }
}
