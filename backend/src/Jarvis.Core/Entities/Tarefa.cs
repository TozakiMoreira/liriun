using Jarvis.Core.Enums;
using Jarvis.Core.Exceptions;

namespace Jarvis.Core.Entities;

public class Tarefa
{
    private static readonly TimeSpan HorarioFinalDefault = new(23, 59, 0);

    public Guid Id { get; private set; }
    public Guid UsuarioId { get; private set; }
    public string Nome { get; private set; } = null!;

    public Guid? PrazoId { get; private set; }
    public DateTime? DataPrazo { get; private set; }
    public TimeSpan HorarioFinal { get; private set; }

    public Prioridade Prioridade { get; private set; }
    public StatusTarefa Status { get; private set; }

    public DateTime CriadaEm { get; private set; }
    public DateTime? ConcluidaEm { get; private set; }

    public ICollection<TarefaCategoria> Categorias { get; private set; } = new List<TarefaCategoria>();

    private Tarefa() { }

    public Tarefa(
        Guid usuarioId,
        string nome,
        Prioridade prioridade,
        Guid? prazoId = null,
        DateTime? dataPrazo = null,
        TimeSpan? horarioFinal = null)
    {
        Id = Guid.NewGuid();
        UsuarioId = usuarioId;
        Nome = nome?.Trim() ?? string.Empty;
        Prioridade = prioridade;
        PrazoId = prazoId;
        DataPrazo = dataPrazo?.Date;
        HorarioFinal = horarioFinal ?? HorarioFinalDefault;
        Status = StatusTarefa.Pendente;
        CriadaEm = DateTime.UtcNow;
        Validar();
    }

    private void Validar()
    {
        if (UsuarioId == Guid.Empty)
            throw new TarefaException("Tarefa precisa estar vinculada a um usuário");

        if (string.IsNullOrWhiteSpace(Nome))
            throw new TarefaException("Nome da tarefa é obrigatório");

        if (Nome.Length > 200)
            throw new TarefaException("Nome da tarefa não pode passar de 200 caracteres");

        if (HorarioFinal < TimeSpan.Zero || HorarioFinal >= TimeSpan.FromDays(1))
            throw new TarefaException("Horário final deve estar entre 00:00 e 23:59");
    }

    public void Concluir()
    {
        if (Status == StatusTarefa.Concluida)
            throw new TarefaException("Tarefa já está concluída");

        Status = StatusTarefa.Concluida;
        ConcluidaEm = DateTime.UtcNow;
    }

    public void Atualizar(
        string nome,
        Prioridade prioridade,
        Guid? prazoId,
        DateTime? dataPrazo,
        TimeSpan? horarioFinal)
    {
        if (Status == StatusTarefa.Concluida)
            throw new TarefaException("Não é possível editar tarefa concluída");

        Nome = nome?.Trim() ?? string.Empty;
        Prioridade = prioridade;
        PrazoId = prazoId;
        DataPrazo = dataPrazo?.Date;
        HorarioFinal = horarioFinal ?? HorarioFinalDefault;
        Validar();
    }

    /// <summary>
    /// Status computado pra listagem: se passou do prazo + horário final, vira Atrasada.
    /// Não muta o estado persistido — só decide o que exibir.
    /// </summary>
    public StatusTarefa StatusComputado(DateTime agora)
    {
        if (Status == StatusTarefa.Concluida)
            return StatusTarefa.Concluida;

        if (!DataPrazo.HasValue)
            return StatusTarefa.Pendente;

        var limite = DataPrazo.Value.Add(HorarioFinal);
        return agora > limite ? StatusTarefa.Atrasada : StatusTarefa.Pendente;
    }
}
