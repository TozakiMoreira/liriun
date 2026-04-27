using Jarvis.Core.Entities;
using Jarvis.Core.Interfaces.Repositories;
using Jarvis.Infrastructure.Persistence;
using Jarvis.Infrastructure.Persistence.Mappers;
using Jarvis.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace Jarvis.Infrastructure.Repositories;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly JarvisDbContext _db;

    public UsuarioRepository(JarvisDbContext db)
    {
        _db = db;
    }

    public async Task<Usuario?> ObterPorIdAsync(Guid id, CancellationToken ct)
    {
        UsuarioModel? model = await _db.Usuarios.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id, ct);
        return model is null ? null : UsuarioMapper.ToEntity(model);
    }

    public async Task<Usuario?> ObterPorEmailAsync(string email, CancellationToken ct)
    {
        string normalizado = email.Trim().ToLowerInvariant();
        UsuarioModel? model = await _db.Usuarios.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == normalizado, ct);
        return model is null ? null : UsuarioMapper.ToEntity(model);
    }

    public async Task<Usuario> AdicionarAsync(Usuario usuario, CancellationToken ct)
    {
        UsuarioModel model = UsuarioMapper.ToModel(usuario);
        await _db.Usuarios.AddAsync(model, ct);
        await _db.SaveChangesAsync(ct);
        return usuario;
    }

    public async Task<Usuario> AtualizarAsync(Usuario usuario, CancellationToken ct)
    {
        UsuarioModel model = UsuarioMapper.ToModel(usuario);
        _db.Usuarios.Update(model);
        await _db.SaveChangesAsync(ct);
        return usuario;
    }
}
