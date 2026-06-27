using Liriun.Application.Interfaces;
using Liriun.Core.Common;
using Microsoft.EntityFrameworkCore;

namespace Liriun.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly LiriunDbContext _db;

    public UnitOfWork(LiriunDbContext db) => _db = db;

    public Task<int> SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);

    public async Task<Result<T>> ExecuteInTransactionAsync<T>(Func<CancellationToken, Task<Result<T>>> acao, CancellationToken ct)
    {
        // Os repositorios compartilham a mesma instancia (scoped) do DbContext, entao os
        // SaveChanges/ExecuteUpdate deles se alistam nesta transacao.
        await using var transacao = await _db.Database.BeginTransactionAsync(ct);
        try
        {
            Result<T> resultado = await acao(ct);
            if (resultado.IsSuccess)
                await transacao.CommitAsync(ct);
            else
                await transacao.RollbackAsync(ct);
            return resultado;
        }
        catch
        {
            await transacao.RollbackAsync(ct);
            throw;
        }
    }
}
