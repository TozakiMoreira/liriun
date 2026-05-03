using Liriun.Core.Entities;
using Liriun.Infrastructure.Persistence.Models;

namespace Liriun.Infrastructure.Persistence.Mappers;

internal static class CategoriaMapper
{
    public static CategoriaModel ToModel(Categoria entity) => new()
    {
        Id = entity.Id,
        UsuarioId = entity.UsuarioId,
        Nome = entity.Nome,
        CriadaEm = entity.CriadaEm
    };

    public static Categoria ToEntity(CategoriaModel model)
        => Categoria.Reconstituir(model.Id, model.UsuarioId, model.Nome, model.CriadaEm);
}
