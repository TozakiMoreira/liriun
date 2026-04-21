using Jarvis.Core.Entities;
using Jarvis.Core.Interfaces.Repositories;
using Jarvis.Infra.Data;

namespace Jarvis.Infra.Repositories;

public partial class CategoriaRepository : ICategoriaRepository
{
    private readonly JarvisDbContext _db;

    public CategoriaRepository(JarvisDbContext db)
    {
        _db = db;
    }

    public async Task AdicionarAsync(Categoria categoria, CancellationToken ct = default)
    {
        await _db.Categorias.AddAsync(categoria, ct);
        await _db.SaveChangesAsync(ct);
    }

    public async Task AtualizarAsync(Categoria categoria, CancellationToken ct = default)
    {
        _db.Categorias.Update(categoria);
        await _db.SaveChangesAsync(ct);
    }

    public async Task RemoverAsync(Categoria categoria, CancellationToken ct = default)
    {
        _db.Categorias.Remove(categoria);
        await _db.SaveChangesAsync(ct);
    }
}
