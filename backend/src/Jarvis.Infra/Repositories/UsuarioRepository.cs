using Jarvis.Core.Entities;
using Jarvis.Core.Interfaces.Repositories;
using Jarvis.Infra.Data;
using Microsoft.EntityFrameworkCore;

namespace Jarvis.Infra.Repositories;

public partial class UsuarioRepository : IUsuarioRepository
{
    private readonly JarvisDbContext _db;

    public UsuarioRepository(JarvisDbContext db)
    {
        _db = db;
    }

    public async Task Adicionar(Usuario usuario, CancellationToken ct = default)
    {
        await _db.Usuarios.AddAsync(usuario, ct);
        await _db.SaveChangesAsync(ct);
    }

    public async Task Atualizar(Usuario usuario, CancellationToken ct = default)
    {
        _db.Usuarios.Update(usuario);
        await _db.SaveChangesAsync(ct);
    }
}
