using Liriun.Core.Entities;
using Liriun.Infrastructure.Persistence.Models;

namespace Liriun.Infrastructure.Persistence.Mappers;

internal static class LancamentoMapper
{
    public static LancamentoModel ToModel(Lancamento entity) => new()
    {
        Id = entity.Id,
        UsuarioId = entity.UsuarioId,
        Tipo = entity.Tipo,
        Descricao = entity.Descricao,
        Valor = entity.Valor,
        DataReferencia = entity.DataReferencia,
        Categoria = entity.Categoria,
        Status = entity.Status,
        Recorrencia = entity.Recorrencia,
        AnexoBoleto = entity.AnexoBoleto,
        Observacoes = entity.Observacoes,
        CriadoEm = entity.CriadoEm,
        PagoEm = entity.PagoEm
    };

    public static Lancamento ToEntity(LancamentoModel model)
        => Lancamento.Reconstituir(
            model.Id,
            model.UsuarioId,
            model.Tipo,
            model.Descricao,
            model.Valor,
            model.DataReferencia,
            model.Categoria,
            model.Status,
            model.Recorrencia,
            model.AnexoBoleto,
            model.Observacoes,
            model.CriadoEm,
            model.PagoEm);
}
