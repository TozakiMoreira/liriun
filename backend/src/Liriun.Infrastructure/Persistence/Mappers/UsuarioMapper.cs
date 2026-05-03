using Liriun.Core.Entities;
using Liriun.Infrastructure.Persistence.Models;

namespace Liriun.Infrastructure.Persistence.Mappers;

internal static class UsuarioMapper
{
    public static UsuarioModel ToModel(Usuario entity) => new()
    {
        Id = entity.Id,
        Nome = entity.Nome,
        Email = entity.Email,
        SenhaHash = entity.SenhaHash,
        FotoUrl = entity.FotoUrl,
        CriadoEm = entity.CriadoEm
    };

    public static Usuario ToEntity(UsuarioModel model)
        => Usuario.Reconstituir(model.Id, model.Nome, model.Email, model.SenhaHash, model.FotoUrl, model.CriadoEm);
}
