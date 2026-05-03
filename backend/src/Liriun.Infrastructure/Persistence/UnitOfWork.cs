using Liriun.Application.Interfaces;

namespace Liriun.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly LiriunDbContext _db;

    public UnitOfWork(LiriunDbContext db) => _db = db;

    public Task<int> SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}
