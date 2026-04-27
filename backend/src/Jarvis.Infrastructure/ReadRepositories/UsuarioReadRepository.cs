using Jarvis.Application.ReadRepositories;
using Jarvis.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Jarvis.Infrastructure.ReadRepositories;

public class UsuarioReadRepository : IUsuarioReadRepository
{
    private readonly JarvisDbContext _db;

    public UsuarioReadRepository(JarvisDbContext db)
    {
        _db = db;
    }

    public Task<bool> ExisteEmailAsync(string email, CancellationToken ct)
    {
        string normalizado = email.Trim().ToLowerInvariant();
        return _db.Usuarios.AsNoTracking().AnyAsync(u => u.Email == normalizado, ct);
    }
}
