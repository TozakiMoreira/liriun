using Liriun.Application.ReadRepositories;
using Liriun.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Liriun.Infrastructure.ReadRepositories;

public class UsuarioReadRepository : IUsuarioReadRepository
{
    private readonly LiriunDbContext _db;

    public UsuarioReadRepository(LiriunDbContext db)
    {
        _db = db;
    }

    public Task<bool> ExisteEmailAsync(string email, CancellationToken ct)
    {
        string normalizado = email.Trim().ToLowerInvariant();
        return _db.Usuarios.AsNoTracking().AnyAsync(u => u.Email == normalizado, ct);
    }
}
