using Jarvis.Core.Enums;
using Jarvis.Core.Exceptions;

namespace Jarvis.Application.InputModels.Tarefas;

public class AtualizarTarefaInput
{
    public string Nome { get; }
    public Prioridade Prioridade { get; }
    public IReadOnlyList<Guid> CategoriaIds { get; }
    public Guid? PrazoId { get; }
    public DateTime? DataPrazoCustom { get; }
    public TimeSpan? HorarioFinal { get; }

    public AtualizarTarefaInput(
        string nome,
        Prioridade prioridade,
        IReadOnlyList<Guid>? categoriaIds = null,
        Guid? prazoId = null,
        DateTime? dataPrazoCustom = null,
        TimeSpan? horarioFinal = null)
    {
        Nome = nome?.Trim() ?? string.Empty;
        Prioridade = prioridade;
        CategoriaIds = (categoriaIds ?? Array.Empty<Guid>()).Distinct().ToList();
        PrazoId = prazoId;
        DataPrazoCustom = dataPrazoCustom?.Date;
        HorarioFinal = horarioFinal;
        Validar();
    }

    private void Validar()
    {
        if (string.IsNullOrWhiteSpace(Nome))
            throw new ApplicationLayerException("Nome da tarefa é obrigatório");

        if (Nome.Length > 200)
            throw new ApplicationLayerException("Nome da tarefa não pode passar de 200 caracteres");

        if (PrazoId.HasValue && DataPrazoCustom.HasValue)
            throw new ApplicationLayerException("Use prazo cadastrado ou data custom, não os dois");

        if (HorarioFinal.HasValue && (HorarioFinal.Value < TimeSpan.Zero || HorarioFinal.Value >= TimeSpan.FromDays(1)))
            throw new ApplicationLayerException("Horário final deve estar entre 00:00 e 23:59");
    }
}
