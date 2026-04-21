using Jarvis.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Jarvis.Infra.Repositories;

public partial class UsuarioRepository
{
    public Task<Usuario?> ObterPorIdAsync(Guid id, CancellationToken ct = default)
        => _db.Usuarios.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id, ct);

    public Task<Usuario?> ObterPorEmailAsync(string email, CancellationToken ct = default)
    {
        var normalizado = email.Trim().ToLowerInvariant();
        return _db.Usuarios.AsNoTracking().FirstOrDefaultAsync(u => u.Email == normalizado, ct);
    }

    public Task<bool> ExisteEmailAsync(string email, CancellationToken ct = default)
    {
        var normalizado = email.Trim().ToLowerInvariant();
        return _db.Usuarios.AnyAsync(u => u.Email == normalizado, ct);
    }
}
