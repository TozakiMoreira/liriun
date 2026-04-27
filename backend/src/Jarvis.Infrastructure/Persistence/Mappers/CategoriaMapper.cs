using Jarvis.Core.Entities;
using Jarvis.Infrastructure.Persistence.Models;

namespace Jarvis.Infrastructure.Persistence.Mappers;

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
