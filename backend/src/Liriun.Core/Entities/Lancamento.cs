using Liriun.Core.Common;
using Liriun.Core.Enums;
using Liriun.Core.Errors;

namespace Liriun.Core.Entities;

/// <summary>
/// Lançamento financeiro — receita ou despesa. Categorias receita: < 100. Categorias despesa: >= 100.
/// </summary>
public class Lancamento
{
    private const int DescricaoMaxLength = 200;
    private const int ObservacoesMaxLength = 2000;
    private const int AnexoMaxBase64Length = 1_400_000; // ~1MB binário em base64

    public Guid Id { get; private set; }
    public Guid UsuarioId { get; private set; }
    public TipoLancamento Tipo { get; private set; }
    public string Descricao { get; private set; } = null!;
    public decimal Valor { get; private set; }
    public DateTime DataReferencia { get; private set; }
    public CategoriaLancamento Categoria { get; private set; }
    public StatusLancamento Status { get; private set; }
    public TipoRecorrencia Recorrencia { get; private set; }
    public string? AnexoBoleto { get; private set; }
    public string? Observacoes { get; private set; }
    public DateTime CriadoEm { get; private set; }
    public DateTime? PagoEm { get; private set; }

    private Lancamento() { }

    internal static Lancamento Reconstituir(
        Guid id, Guid usuarioId, TipoLancamento tipo, string descricao, decimal valor,
        DateTime dataReferencia, CategoriaLancamento categoria, StatusLancamento status,
        TipoRecorrencia recorrencia, string? anexoBoleto, string? observacoes,
        DateTime criadoEm, DateTime? pagoEm)
        => new()
        {
            Id = id, UsuarioId = usuarioId, Tipo = tipo, Descricao = descricao, Valor = valor,
            DataReferencia = dataReferencia, Categoria = categoria, Status = status,
            Recorrencia = recorrencia, AnexoBoleto = anexoBoleto, Observacoes = observacoes,
            CriadoEm = criadoEm, PagoEm = pagoEm
        };

    public static Result<Lancamento> Criar(
        Guid usuarioId,
        TipoLancamento tipo,
        string descricao,
        decimal valor,
        DateTime dataReferencia,
        CategoriaLancamento categoria,
        TipoRecorrencia recorrencia = TipoRecorrencia.Nenhuma,
        string? anexoBoleto = null,
        string? observacoes = null)
    {
        Lancamento l = new()
        {
            Id = Guid.NewGuid(),
            UsuarioId = usuarioId,
            Tipo = tipo,
            Descricao = descricao?.Trim() ?? string.Empty,
            Valor = valor,
            DataReferencia = dataReferencia.Date,
            Categoria = categoria,
            Status = tipo == TipoLancamento.Receita ? StatusLancamento.Pago : StatusLancamento.Pendente,
            Recorrencia = recorrencia,
            AnexoBoleto = NormalizarAnexo(anexoBoleto),
            Observacoes = NormalizarObservacoes(observacoes),
            CriadoEm = DateTime.UtcNow,
            PagoEm = tipo == TipoLancamento.Receita ? dataReferencia.Date : null
        };

        Result validacao = l.Validar();
        if (validacao.IsFailure)
            return Result<Lancamento>.Failure(validacao.Error!);

        return Result<Lancamento>.Success(l);
    }

    public Result Atualizar(
        string descricao,
        decimal valor,
        DateTime dataReferencia,
        CategoriaLancamento categoria,
        TipoRecorrencia recorrencia,
        string? anexoBoleto,
        string? observacoes)
    {
        Descricao = descricao?.Trim() ?? string.Empty;
        Valor = valor;
        DataReferencia = dataReferencia.Date;
        Categoria = categoria;
        Recorrencia = recorrencia;
        AnexoBoleto = NormalizarAnexo(anexoBoleto);
        Observacoes = NormalizarObservacoes(observacoes);
        return Validar();
    }

    public Result MarcarComoPago()
    {
        if (Tipo == TipoLancamento.Receita)
            return Result.Success();

        if (Status == StatusLancamento.Pago)
            return Result.Failure(LancamentoErrors.JaPago());

        Status = StatusLancamento.Pago;
        PagoEm = DateTime.UtcNow;
        return Result.Success();
    }

    public Result MarcarComoPendente()
    {
        if (Tipo == TipoLancamento.Receita)
            return Result.Success();

        Status = StatusLancamento.Pendente;
        PagoEm = null;
        return Result.Success();
    }

    /// <summary>
    /// Cria próxima ocorrência de lançamento recorrente. Avança 7 dias (semanal) ou 1 mês (mensal).
    /// </summary>
    public Lancamento? GerarProximaOcorrencia()
    {
        if (Recorrencia == TipoRecorrencia.Nenhuma)
            return null;

        DateTime proxima = Recorrencia switch
        {
            TipoRecorrencia.Semanal => DataReferencia.AddDays(7),
            TipoRecorrencia.Mensal => DataReferencia.AddMonths(1),
            _ => DataReferencia
        };

        Lancamento l = new()
        {
            Id = Guid.NewGuid(),
            UsuarioId = UsuarioId,
            Tipo = Tipo,
            Descricao = Descricao,
            Valor = Valor,
            DataReferencia = proxima.Date,
            Categoria = Categoria,
            Status = Tipo == TipoLancamento.Receita ? StatusLancamento.Pago : StatusLancamento.Pendente,
            Recorrencia = Recorrencia,
            AnexoBoleto = null, // boleto não se replica
            Observacoes = Observacoes,
            CriadoEm = DateTime.UtcNow,
            PagoEm = Tipo == TipoLancamento.Receita ? proxima.Date : null
        };
        return l;
    }

    private Result Validar()
    {
        if (UsuarioId == Guid.Empty)
            return Result.Failure(LancamentoErrors.UsuarioObrigatorio());

        if (string.IsNullOrWhiteSpace(Descricao))
            return Result.Failure(LancamentoErrors.DescricaoObrigatoria());

        if (Descricao.Length > DescricaoMaxLength)
            return Result.Failure(LancamentoErrors.DescricaoMuitoLonga());

        if (Valor <= 0)
            return Result.Failure(LancamentoErrors.ValorInvalido());

        if (DataReferencia == default)
            return Result.Failure(LancamentoErrors.DataObrigatoria());

        bool categoriaReceita = (int)Categoria < 100;
        bool ehReceita = Tipo == TipoLancamento.Receita;
        if (categoriaReceita != ehReceita)
            return Result.Failure(LancamentoErrors.CategoriaIncompativel());

        if (AnexoBoleto is not null)
        {
            if (AnexoBoleto.Length > AnexoMaxBase64Length)
                return Result.Failure(LancamentoErrors.AnexoMuitoGrande());

            if (!AnexoBoleto.StartsWith("data:application/pdf") &&
                !AnexoBoleto.StartsWith("data:image/"))
                return Result.Failure(LancamentoErrors.AnexoFormatoInvalido());
        }

        if (Observacoes is not null && Observacoes.Length > ObservacoesMaxLength)
            return Result.Failure(LancamentoErrors.ObservacoesMuitoLongas());

        return Result.Success();
    }

    private static string? NormalizarObservacoes(string? observacoes)
    {
        if (observacoes is null) return null;
        string trimmed = observacoes.Trim();
        return trimmed.Length == 0 ? null : trimmed;
    }

    private static string? NormalizarAnexo(string? anexo)
    {
        if (anexo is null) return null;
        string trimmed = anexo.Trim();
        return trimmed.Length == 0 ? null : trimmed;
    }
}
