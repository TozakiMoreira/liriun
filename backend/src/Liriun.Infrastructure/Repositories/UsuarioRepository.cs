using Liriun.Core.Entities;
using Liriun.Core.Interfaces.Repositories;
using Liriun.Infrastructure.Persistence;
using Liriun.Infrastructure.Persistence.Mappers;
using Liriun.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace Liriun.Infrastructure.Repositories;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly LiriunDbContext _db;

    public UsuarioRepository(LiriunDbContext db)
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

    public async Task RemoverAsync(Guid usuarioId, CancellationToken ct)
    {
        // Cascade FK no banco (tarefas, categorias, tarefas_categorias) cuida do resto.
        await _db.Usuarios.Where(u => u.Id == usuarioId).ExecuteDeleteAsync(ct);
    }
}
