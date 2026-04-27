using Jarvis.Core.Entities;
using Jarvis.Infrastructure.Persistence.Models;

namespace Jarvis.Infrastructure.Persistence.Mappers;

internal static class PrazoMapper
{
    public static PrazoModel ToModel(Prazo entity) => new()
    {
        Id = entity.Id,
        UsuarioId = entity.UsuarioId,
        Nome = entity.Nome,
        DuracaoDias = entity.DuracaoDias,
        CriadoEm = entity.CriadoEm
    };

    public static Prazo ToEntity(PrazoModel model)
        => Prazo.Reconstituir(model.Id, model.UsuarioId, model.Nome, model.DuracaoDias, model.CriadoEm);
}
