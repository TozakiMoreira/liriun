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

    /// <summary>Tempo total cronometrado na tarefa, em segundos (acumulado). Default 0.</summary>
    public long TempoGastoSegundos { get; private set; }

    public Prioridade Prioridade { get; private set; }
    public StatusTarefa Status { get; private set; }

    public TipoRecorrencia Recorrencia { get; private set; }
    public int RecorrenciaQuantidade { get; private set; }

    public DateTime CriadaEm { get; private set; }
    public DateTime? ConcluidaEm { get; private set; }

    public ICollection<TarefaCategoria> Categorias { get; private set; } = new List<TarefaCategoria>();

    private Tarefa() { }

    internal static Tarefa Reconstituir(
        Guid id, Guid usuarioId, string nome,
        DateTime dataPrazo, TimeSpan? horarioFinal, string? observacoes,
        Prioridade prioridade, StatusTarefa status,
        TipoRecorrencia recorrencia, int recorrenciaQuantidade,
        DateTime criadaEm, DateTime? concluidaEm,
        ICollection<TarefaCategoria>? categorias = null,
        long tempoGastoSegundos = 0)
        => new()
        {
            Id = id, UsuarioId = usuarioId, Nome = nome,
            DataPrazo = dataPrazo, HorarioFinal = horarioFinal, Observacoes = observacoes,
            Prioridade = prioridade, Status = status,
            Recorrencia = recorrencia, RecorrenciaQuantidade = recorrenciaQuantidade,
            CriadaEm = criadaEm, ConcluidaEm = concluidaEm,
            TempoGastoSegundos = tempoGastoSegundos < 0 ? 0 : tempoGastoSegundos,
            Categorias = categorias ?? new List<TarefaCategoria>()
        };

    public static Result<Tarefa> Criar(
        Guid usuarioId,
        string nome,
        Prioridade prioridade,
        DateTime dataPrazo,
        TimeSpan? horarioFinal = null,
        string? observacoes = null,
        TipoRecorrencia recorrencia = TipoRecorrencia.Nenhuma,
        int recorrenciaQuantidade = 1,
        long tempoGastoSegundos = 0)
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
            Recorrencia = recorrencia,
            RecorrenciaQuantidade = NormalizarQuantidade(recorrencia, recorrenciaQuantidade),
            TempoGastoSegundos = tempoGastoSegundos < 0 ? 0 : tempoGastoSegundos,
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
        string? observacoes,
        TipoRecorrencia recorrencia = TipoRecorrencia.Nenhuma,
        int recorrenciaQuantidade = 1,
        long tempoGastoSegundos = 0)
    {
        if (Status == StatusTarefa.Concluida)
            return Result.Failure(TarefaErrors.NaoEditavelConcluida());

        Nome = nome?.Trim() ?? string.Empty;
        Prioridade = prioridade;
        DataPrazo = dataPrazo.Date;
        HorarioFinal = horarioFinal;
        Observacoes = NormalizarObservacoes(observacoes);
        Recorrencia = recorrencia;
        RecorrenciaQuantidade = NormalizarQuantidade(recorrencia, recorrenciaQuantidade);
        TempoGastoSegundos = tempoGastoSegundos < 0 ? 0 : tempoGastoSegundos;
        return Validar();
    }

    private static int NormalizarQuantidade(TipoRecorrencia recorrencia, int quantidade)
    {
        if (recorrencia == TipoRecorrencia.Nenhuma) return 1;
        if (quantidade < 1) return 1;
        if (quantidade > 4) return 4;
        return quantidade;
    }

    /// <summary>
    /// Gera N-1 ocorrências futuras adicionais (a tarefa atual conta como 1).
    /// Datas avançadas: +7d (semanal) ou +1 mês (mensal). Categorias copiadas externamente.
    /// </summary>
    public IReadOnlyList<Tarefa> GerarOcorrenciasFuturas()
    {
        if (Recorrencia == TipoRecorrencia.Nenhuma || RecorrenciaQuantidade <= 1)
            return Array.Empty<Tarefa>();

        List<Tarefa> futuras = new(RecorrenciaQuantidade - 1);
        DateTime data = DataPrazo;
        for (int i = 1; i < RecorrenciaQuantidade; i++)
        {
            data = Recorrencia switch
            {
                TipoRecorrencia.Semanal => data.AddDays(7),
                TipoRecorrencia.Mensal => data.AddMonths(1),
                _ => data,
            };

            futuras.Add(new()
            {
                Id = Guid.NewGuid(),
                UsuarioId = UsuarioId,
                Nome = Nome,
                Prioridade = Prioridade,
                DataPrazo = data.Date,
                HorarioFinal = HorarioFinal,
                Observacoes = Observacoes,
                Status = StatusTarefa.Pendente,
                Recorrencia = Recorrencia,
                RecorrenciaQuantidade = 1, // ocorrência ja gerada — sem replicação
                CriadaEm = DateTime.UtcNow,
            });
        }
        return futuras;
    }

    public const string FusoPadrao = "America/Sao_Paulo";

    public StatusTarefa StatusComputado(DateTime agoraUtc, string? tzId = null)
    {
        if (Status == StatusTarefa.Concluida)
            return StatusTarefa.Concluida;

        // DataPrazo (date) e HorarioFinal (time) sao wall-clock no fuso do usuario.
        // Comparar com agora-em-UTC daria atrasada cedo. Converte pro fuso do usuario.
        DateTime agoraLocal = ConverterParaFusoUsuario(agoraUtc, tzId);
        DateTime limite = DataPrazo.Date.Add(HorarioFinal ?? FimDoDia);
        return agoraLocal > limite ? StatusTarefa.Atrasada : StatusTarefa.Pendente;
    }

    /// <summary>
    /// Converte um instante UTC pro fuso do usuario (IANA, ex: "America/Sao_Paulo").
    /// tzId null/vazio/invalido cai no fuso padrao (BRT). Aceita IANA em qualquer SO
    /// (ICU); em Windows sem ICU, converte IANA->Windows. Ultimo recurso: UTC-3.
    /// </summary>
    public static DateTime ConverterParaFusoUsuario(DateTime agoraUtc, string? tzId = null)
    {
        DateTime utc = agoraUtc.Kind == DateTimeKind.Utc ? agoraUtc : DateTime.SpecifyKind(agoraUtc, DateTimeKind.Utc);
        TimeZoneInfo? tz = ResolverFuso(tzId);
        return tz is null ? utc.AddHours(-3) : TimeZoneInfo.ConvertTimeFromUtc(utc, tz);
    }

    private static TimeZoneInfo? ResolverFuso(string? tzId)
    {
        string id = string.IsNullOrWhiteSpace(tzId) ? FusoPadrao : tzId.Trim();

        if (TryFindFuso(id, out TimeZoneInfo? tz)) return tz;
        if (TimeZoneInfo.TryConvertIanaIdToWindowsId(id, out string? winId) && winId is not null && TryFindFuso(winId, out tz))
            return tz;

        // Fallback pro fuso padrao (BRT) quando o id do usuario nao resolve.
        if (id != FusoPadrao)
        {
            if (TryFindFuso(FusoPadrao, out tz)) return tz;
            if (TimeZoneInfo.TryConvertIanaIdToWindowsId(FusoPadrao, out string? winPad) && winPad is not null && TryFindFuso(winPad, out tz))
                return tz;
        }

        return null; // chamador aplica UTC-3
    }

    private static bool TryFindFuso(string id, out TimeZoneInfo? tz)
    {
        try
        {
            tz = TimeZoneInfo.FindSystemTimeZoneById(id);
            return true;
        }
        catch (Exception e) when (e is TimeZoneNotFoundException or InvalidTimeZoneException)
        {
            tz = null;
            return false;
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
