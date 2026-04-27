using Jarvis.Application.Interfaces;

namespace Jarvis.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly JarvisDbContext _db;

    public UnitOfWork(JarvisDbContext db) => _db = db;

    public Task<int> SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}
