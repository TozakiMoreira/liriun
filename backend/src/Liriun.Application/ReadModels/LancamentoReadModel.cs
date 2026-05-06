using Liriun.Core.Enums;

namespace Liriun.Application.ReadModels;

public sealed record LancamentoReadModel(
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
    DateTime? PagoEm);

public sealed record BalancoReadModel(
    int Ano,
    int? Mes,
    decimal TotalReceitas,
    decimal TotalDespesasPagas,
    decimal TotalDespesasPendentes,
    decimal Saldo,
    IReadOnlyList<BalancoCategoriaReadModel> PorCategoria,
    IReadOnlyList<BalancoMesReadModel> PorMes);

public sealed record BalancoCategoriaReadModel(
    CategoriaLancamento Categoria,
    TipoLancamento Tipo,
    decimal Total);

public sealed record BalancoMesReadModel(
    int Mes,
    decimal Receitas,
    decimal Despesas);
