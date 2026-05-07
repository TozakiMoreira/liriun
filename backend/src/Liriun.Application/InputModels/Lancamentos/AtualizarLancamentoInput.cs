using Liriun.Core.Enums;

namespace Liriun.Application.InputModels.Lancamentos;

public sealed record AtualizarLancamentoInput(
    string Descricao,
    decimal Valor,
    DateTime DataReferencia,
    CategoriaLancamento Categoria,
    TipoRecorrencia Recorrencia = TipoRecorrencia.Nenhuma,
    string? AnexoBoleto = null,
    string? Observacoes = null,
    DateTime? DataPagamento = null);
