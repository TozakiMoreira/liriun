using Jarvis.Application.ReadModels;
using Jarvis.Core.Entities;

namespace Jarvis.Application.ViewModels.Categorias;

public sealed record CategoriaViewModel(
    Guid Id,
    string Nome,
    DateTime CriadaEm)
{
    public static CategoriaViewModel FromEntity(Categoria categoria)
        => new(categoria.Id, categoria.Nome, categoria.CriadaEm);

    public static CategoriaViewModel FromReadModel(CategoriaReadModel readModel)
        => new(readModel.Id, readModel.Nome, readModel.CriadaEm);
}
