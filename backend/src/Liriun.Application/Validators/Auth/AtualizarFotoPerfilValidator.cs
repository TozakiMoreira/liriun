using FluentValidation;
using Liriun.Application.InputModels.Auth;

namespace Liriun.Application.Validators.Auth;

public sealed class AtualizarFotoPerfilValidator : AbstractValidator<AtualizarFotoPerfilInput>
{
    private const int FotoUrlMaxLength = 700_000;

    public AtualizarFotoPerfilValidator()
    {
        When(x => !string.IsNullOrWhiteSpace(x.FotoUrl), () =>
        {
            RuleFor(x => x.FotoUrl!)
                .Must(v => v.StartsWith("data:image/", StringComparison.Ordinal))
                .WithMessage("Foto precisa estar em formato data:image/...");

            RuleFor(x => x.FotoUrl!)
                .MaximumLength(FotoUrlMaxLength)
                .WithMessage("A foto excede o tamanho maximo permitido");
        });
    }
}
