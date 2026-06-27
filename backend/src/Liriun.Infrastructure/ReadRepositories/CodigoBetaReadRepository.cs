using Liriun.Application.ReadModels;
using Liriun.Application.ReadRepositories;
using Liriun.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Liriun.Infrastructure.ReadRepositories;

public class CodigoBetaReadRepository : ICodigoBetaReadRepository
{
    private readonly LiriunDbContext _db;

    public CodigoBetaReadRepository(LiriunDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<CodigoBetaReadModel>> ListarAsync(CancellationToken ct)
        => await _db.CodigosBeta.AsNoTracking()
            .OrderByDescending(c => c.CriadoEm)
            .Select(c => new CodigoBetaReadModel(
                c.Id,
                c.Codigo,
                c.CriadoEm,
                c.UsadoEm,
                c.RevogadoEm,
                c.ExpiraEm,
                c.UsadoPorUsuarioId == null
                    ? null
                    : _db.Usuarios.Where(u => u.Id == c.UsadoPorUsuarioId)
                                  .Select(u => u.Email)
                                  .FirstOrDefault()))
            .ToListAsync(ct);
}
