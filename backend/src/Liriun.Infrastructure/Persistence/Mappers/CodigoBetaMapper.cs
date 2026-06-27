using Liriun.Core.Entities;
using Liriun.Infrastructure.Persistence.Models;

namespace Liriun.Infrastructure.Persistence.Mappers;

internal static class CodigoBetaMapper
{
    public static CodigoBetaModel ToModel(CodigoBeta entity) => new()
    {
        Id = entity.Id,
        Codigo = entity.Codigo,
        CriadoPorUsuarioId = entity.CriadoPorUsuarioId,
        CriadoEm = entity.CriadoEm,
        UsadoPorUsuarioId = entity.UsadoPorUsuarioId,
        UsadoEm = entity.UsadoEm,
        RevogadoEm = entity.RevogadoEm,
        ExpiraEm = entity.ExpiraEm
    };

    public static CodigoBeta ToEntity(CodigoBetaModel model)
        => CodigoBeta.Reconstituir(
            model.Id, model.Codigo, model.CriadoPorUsuarioId, model.CriadoEm,
            model.UsadoPorUsuarioId, model.UsadoEm, model.RevogadoEm, model.ExpiraEm);
}
