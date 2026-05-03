using Liriun.Core.Common;
using Liriun.Core.Enums;
using Liriun.Core.Errors;

namespace Liriun.Core.Entities;

public class Tarefa
{
    private const int ObservacoesMaxLength = 4000;
    private static readonly TimeSpan FimDoDia = new(23, 59, 59);

    public Guid Id { get; private set; }
    public Guid UsuarioId { get; private set; }
    public string Nome { get; private set; } = null!;

    public DateTime DataPrazo { get; private set; }
    public TimeSpan? HorarioFinal { get; private set; }
    public string? Observacoes { get; private set; }

    public Prioridade Prioridade { get; private set; }
    public StatusTarefa Status { get; private set; }

    public DateTime CriadaEm { get; private set; }
    public DateTime? ConcluidaEm { get; private set; }

    public ICollection<TarefaCategoria> Categorias { get; private set; } = new List<TarefaCategoria>();

    private Tarefa() { }

    internal static Tarefa Reconstituir(
        Guid id, Guid usuarioId, string nome,
        DateTime dataPrazo, TimeSpan? horarioFinal, string? observacoes,
        Prioridade prioridade, StatusTarefa status,
        DateTime criadaEm, DateTime? concluidaEm,
        ICollection<TarefaCategoria>? categorias = null)
        => new()
        {
            Id = id, UsuarioId = usuarioId, Nome = nome,
            DataPrazo = dataPrazo, HorarioFinal = horarioFinal, Observacoes = observacoes,
            Prioridade = prioridade, Status = status,
            CriadaEm = criadaEm, ConcluidaEm = concluidaEm,
            Categorias = categorias ?? new List<TarefaCategoria>()
        };

    public static Result<Tarefa> Criar(
        Guid usuarioId,
        string nome,
        Prioridade prioridade,
        DateTime dataPrazo,
        TimeSpan? horarioFinal = null,
        string? observacoes = null)
    {
        Tarefa tarefa = new()
        {
            Id = Guid.NewGuid(),
            UsuarioId = usuarioId,
            Nome = nome?.Trim() ?? string.Empty,
            Prioridade = prioridade,
            DataPrazo = dataPrazo.Date,
            HorarioFinal = horarioFinal,
            Observacoes = NormalizarObservacoes(observacoes),
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

    public Result Reabrir()
    {
        if (Status != StatusTarefa.Concluida)
            return Result.Failure(TarefaErrors.NaoConcluidaParaReabrir());

        Status = StatusTarefa.Pendente;
        ConcluidaEm = null;
        return Result.Success();
    }

    public Result Atualizar(
        string nome,
        Prioridade prioridade,
        DateTime dataPrazo,
        TimeSpan? horarioFinal,
        string? observacoes)
    {
        if (Status == StatusTarefa.Concluida)
            return Result.Failure(TarefaErrors.NaoEditavelConcluida());

        Nome = nome?.Trim() ?? string.Empty;
        Prioridade = prioridade;
        DataPrazo = dataPrazo.Date;
        HorarioFinal = horarioFinal;
        Observacoes = NormalizarObservacoes(observacoes);
        return Validar();
    }

    public StatusTarefa StatusComputado(DateTime agoraUtc)
    {
        if (Status == StatusTarefa.Concluida)
            return StatusTarefa.Concluida;

        // DataPrazo (date) e HorarioFinal (time) sao wall-clock no fuso do usuario.
        // Comparar com agora-em-UTC daria atrasada 3h cedo no Brasil. Converte pra BRT.
        DateTime agoraLocal = ConverterParaFusoUsuario(agoraUtc);
        DateTime limite = DataPrazo.Date.Add(HorarioFinal ?? FimDoDia);
        return agoraLocal > limite ? StatusTarefa.Atrasada : StatusTarefa.Pendente;
    }

    public static DateTime ConverterParaFusoUsuario(DateTime agoraUtc)
    {
        DateTime utc = agoraUtc.Kind == DateTimeKind.Utc ? agoraUtc : DateTime.SpecifyKind(agoraUtc, DateTimeKind.Utc);
        try
        {
            // Linux/Mac usa IANA, Windows usa Win key. TimeZoneInfo cuida do fallback do sistema.
            TimeZoneInfo tz = TimeZoneInfo.FindSystemTimeZoneById(
                OperatingSystem.IsWindows() ? "E. South America Standard Time" : "America/Sao_Paulo");
            return TimeZoneInfo.ConvertTimeFromUtc(utc, tz);
        }
        catch (TimeZoneNotFoundException)
        {
            return utc.AddHours(-3);
        }
    }

    private Result Validar()
    {
        if (UsuarioId == Guid.Empty)
            return Result.Failure(TarefaErrors.UsuarioObrigatorio());

        if (string.IsNullOrWhiteSpace(Nome))
            return Result.Failure(TarefaErrors.NomeObrigatorio());

        if (Nome.Length > 200)
            return Result.Failure(TarefaErrors.NomeMuitoLongo());

        if (DataPrazo == default)
            return Result.Failure(TarefaErrors.DataPrazoObrigatoria());

        if (HorarioFinal.HasValue && (HorarioFinal.Value < TimeSpan.Zero || HorarioFinal.Value >= TimeSpan.FromDays(1)))
            return Result.Failure(TarefaErrors.HorarioFinalInvalido());

        if (Observacoes is not null && Observacoes.Length > ObservacoesMaxLength)
            return Result.Failure(TarefaErrors.ObservacoesMuitoLongas());

        return Result.Success();
    }

    private static string? NormalizarObservacoes(string? observacoes)
    {
        if (observacoes is null) return null;
        string trimmed = observacoes.Trim();
        return trimmed.Length == 0 ? null : trimmed;
    }
}
