using Jarvis.Core.Common;
using Jarvis.Core.Enums;
using Jarvis.Core.Errors;

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

    internal static Tarefa Reconstituir(
        Guid id, Guid usuarioId, string nome,
        Guid? prazoId, DateTime? dataPrazo, TimeSpan horarioFinal,
        Prioridade prioridade, StatusTarefa status,
        DateTime criadaEm, DateTime? concluidaEm,
        ICollection<TarefaCategoria>? categorias = null)
        => new()
        {
            Id = id, UsuarioId = usuarioId, Nome = nome,
            PrazoId = prazoId, DataPrazo = dataPrazo, HorarioFinal = horarioFinal,
            Prioridade = prioridade, Status = status,
            CriadaEm = criadaEm, ConcluidaEm = concluidaEm,
            Categorias = categorias ?? new List<TarefaCategoria>()
        };

    public static Result<Tarefa> Criar(
        Guid usuarioId,
        string nome,
        Prioridade prioridade,
        Guid? prazoId = null,
        DateTime? dataPrazo = null,
        TimeSpan? horarioFinal = null)
    {
        Tarefa tarefa = new()
        {
            Id = Guid.NewGuid(),
            UsuarioId = usuarioId,
            Nome = nome?.Trim() ?? string.Empty,
            Prioridade = prioridade,
            PrazoId = prazoId,
            DataPrazo = dataPrazo?.Date,
            HorarioFinal = horarioFinal ?? HorarioFinalDefault,
            Status = StatusTarefa.Pendente,
            CriadaEm = DateTime.UtcNow
        };

        Result validacao = tarefa.Validar();
        if (validacao.IsFailure)
            return Result<Tarefa>.Failure(validacao.Error!);

        return Result<Tarefa>.Success(tarefa);
    }

    public Result Concluir()
    {
        if (Status == StatusTarefa.Concluida)
            return Result.Failure(TarefaErrors.JaConcluida());

        Status = StatusTarefa.Concluida;
        ConcluidaEm = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Atualizar(
        string nome,
        Prioridade prioridade,
        Guid? prazoId,
        DateTime? dataPrazo,
        TimeSpan? horarioFinal)
    {
        if (Status == StatusTarefa.Concluida)
            return Result.Failure(TarefaErrors.NaoEditavelConcluida());

        Nome = nome?.Trim() ?? string.Empty;
        Prioridade = prioridade;
        PrazoId = prazoId;
        DataPrazo = dataPrazo?.Date;
        HorarioFinal = horarioFinal ?? HorarioFinalDefault;
        return Validar();
    }

    public StatusTarefa StatusComputado(DateTime agora)
    {
        if (Status == StatusTarefa.Concluida)
            return StatusTarefa.Concluida;

        if (!DataPrazo.HasValue)
            return StatusTarefa.Pendente;

        DateTime limite = DataPrazo.Value.Add(HorarioFinal);
        return agora > limite ? StatusTarefa.Atrasada : StatusTarefa.Pendente;
    }

    private Result Validar()
    {
        if (UsuarioId == Guid.Empty)
            return Result.Failure(TarefaErrors.UsuarioObrigatorio());

        if (string.IsNullOrWhiteSpace(Nome))
            return Result.Failure(TarefaErrors.NomeObrigatorio());

        if (Nome.Length > 200)
            return Result.Failure(TarefaErrors.NomeMuitoLongo());

        if (HorarioFinal < TimeSpan.Zero || HorarioFinal >= TimeSpan.FromDays(1))
            return Result.Failure(TarefaErrors.HorarioFinalInvalido());

        return Result.Success();
    }
}
