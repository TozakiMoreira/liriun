using FluentValidation;
using Jarvis.Application.InputModels.Tarefas;

namespace Jarvis.Application.Validators.Tarefas;

public sealed class CriarTarefaValidator : AbstractValidator<CriarTarefaInput>
{
    public CriarTarefaValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome da tarefa e obrigatorio")
            .MaximumLength(200).WithMessage("Nome da tarefa nao pode passar de 200 caracteres");

        RuleFor(x => x.DataPrazo)
            .NotEqual(default(DateTime)).WithMessage("Data do prazo e obrigatoria")
            .Must(d => d.Date >= DateTime.UtcNow.Date.AddDays(-1))
            .WithMessage("Data do prazo nao pode ser anterior a hoje");

        RuleFor(x => x.HorarioFinal)
            .Must(h => h >= TimeSpan.Zero && h < TimeSpan.FromDays(1))
            .When(x => x.HorarioFinal.HasValue)
            .WithMessage("Horario final deve estar entre 00:00 e 23:59");

        RuleFor(x => x.Observacoes)
            .MaximumLength(4000).WithMessage("Observacoes nao pode passar de 4000 caracteres");
    }
}
