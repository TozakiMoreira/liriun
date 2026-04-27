using FluentValidation;
using Jarvis.Application.InputModels.Categorias;

namespace Jarvis.Application.Validators.Categorias;

public sealed class CriarCategoriaValidator : AbstractValidator<CriarCategoriaInput>
{
    public CriarCategoriaValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome da categoria e obrigatorio")
            .MaximumLength(50).WithMessage("Nome da categoria nao pode passar de 50 caracteres");
    }
}
