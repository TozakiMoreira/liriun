using Jarvis.Core.Entities;

namespace Jarvis.Application.ViewModels.Categorias;

public class CategoriaViewModel
{
    public Guid Id { get; init; }
    public string Nome { get; init; } = null!;
    public DateTime CriadaEm { get; init; }

    public static CategoriaViewModel From(Categoria categoria) => new()
    {
        Id = categoria.Id,
        Nome = categoria.Nome,
        CriadaEm = categoria.CriadaEm
    };
}
