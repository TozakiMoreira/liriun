using Liriun.Application.ReadModels;
using Liriun.Core.Entities;
using Liriun.Core.Enums;

namespace Liriun.Application.ViewModels.Lancamentos;

public sealed record LancamentoViewModel(
    Guid Id,
    TipoLancamento Tipo,
    string Descricao,
    decimal Valor,
    DateTime DataReferencia,
    CategoriaLancamento Categoria,
    StatusLancamento Status,
    TipoRecorrencia Recorrencia,
    bool TemAnexo,
    string? Observacoes,
    DateTime CriadoEm,
    DateTime? PagoEm)
{
    public static LancamentoViewModel FromEntity(Lancamento l)
        => new(
            l.Id,
            l.Tipo,
            l.Descricao,
            l.Valor,
            l.DataReferencia,
            l.Categoria,
            l.Status,
            l.Recorrencia,
            !string.IsNullOrEmpty(l.AnexoBoleto),
            l.Observacoes,
            l.CriadoEm,
            l.PagoEm);

    public static LancamentoViewModel FromReadModel(LancamentoReadModel r)
        => new(
            r.Id,
            r.Tipo,
            r.Descricao,
            r.Valor,
            r.DataReferencia,
            r.Categoria,
            r.Status,
            r.Recorrencia,
            r.TemAnexo,
            r.Observacoes,
            r.CriadoEm,
            r.PagoEm);
}

public sealed record BalancoViewModel(
    int Ano,
    int? Mes,
    decimal TotalReceitas,
    decimal TotalDespesasPagas,
    decimal TotalDespesasPendentes,
    decimal Saldo,
    IReadOnlyList<BalancoCategoriaViewModel> PorCategoria,
    IReadOnlyList<BalancoMesViewModel> PorMes)
{
    public static BalancoViewModel FromReadModel(BalancoReadModel r)
        => new(
            r.Ano,
            r.Mes,
            r.TotalReceitas,
            r.TotalDespesasPagas,
            r.TotalDespesasPendentes,
            r.Saldo,
            r.PorCategoria.Select(c => new BalancoCategoriaViewModel(c.Categoria, c.Tipo, c.Total)).ToList(),
            r.PorMes.Select(m => new BalancoMesViewModel(m.Mes, m.Receitas, m.Despesas)).ToList());
}

public sealed record BalancoCategoriaViewModel(CategoriaLancamento Categoria, TipoLancamento Tipo, decimal Total);
public sealed record BalancoMesViewModel(int Mes, decimal Receitas, decimal Despesas);
