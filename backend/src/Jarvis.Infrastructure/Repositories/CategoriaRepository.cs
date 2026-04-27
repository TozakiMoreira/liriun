using Jarvis.Core.Entities;
using Jarvis.Core.Interfaces.Repositories;
using Jarvis.Infrastructure.Persistence;
using Jarvis.Infrastructure.Persistence.Mappers;
using Jarvis.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace Jarvis.Infrastructure.Repositories;

public class CategoriaRepository : ICategoriaRepository
{
    private readonly JarvisDbContext _db;

    public CategoriaRepository(JarvisDbContext db)
    {
        _db = db;
    }

    public async Task<Categoria?> ObterPorIdAsync(Guid id, Guid usuarioId, CancellationToken ct)
    {
        CategoriaModel? model = await _db.Categorias.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id && c.UsuarioId == usuarioId, ct);
        return model is null ? null : CategoriaMapper.ToEntity(model);
    }

    public async Task<Categoria> AdicionarAsync(Categoria categoria, CancellationToken ct)
    {
        CategoriaModel model = CategoriaMapper.ToModel(categoria);
        await _db.Categorias.AddAsync(model, ct);
        await _db.SaveChangesAsync(ct);
        return categoria;
    }

    public async Task<Categoria> AtualizarAsync(Categoria categoria, CancellationToken ct)
    {
        CategoriaModel model = CategoriaMapper.ToModel(categoria);
        _db.Categorias.Update(model);
        await _db.SaveChangesAsync(ct);
        return categoria;
    }

    public async Task RemoverAsync(Categoria categoria, CancellationToken ct)
    {
        CategoriaModel model = CategoriaMapper.ToModel(categoria);
        _db.Categorias.Remove(model);
        await _db.SaveChangesAsync(ct);
    }
}
