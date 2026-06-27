using Liriun.Core.Common;
using Liriun.Core.Entities;
using Liriun.Core.Errors;
using Liriun.Core.Interfaces.Repositories;
using Liriun.Infrastructure.Persistence;
using Liriun.Infrastructure.Persistence.Mappers;
using Liriun.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace Liriun.Infrastructure.Repositories;

public class CodigoBetaRepository : ICodigoBetaRepository
{
    private readonly LiriunDbContext _db;

    public CodigoBetaRepository(LiriunDbContext db)
    {
        _db = db;
    }

    public async Task<CodigoBeta> AdicionarAsync(CodigoBeta codigo, CancellationToken ct)
    {
        CodigoBetaModel model = CodigoBetaMapper.ToModel(codigo);
        await _db.CodigosBeta.AddAsync(model, ct);
        await _db.SaveChangesAsync(ct);
        return codigo;
    }

    public async Task<Result> ConsumirAtomicoAsync(string codigo, Guid usuarioId, DateTime agora, CancellationToken ct)
    {
        // UPDATE ... WHERE disponivel: so afeta a linha se ainda estiver livre. Roda na
        // transacao ambiente do DbContext (quando dentro de ExecuteInTransactionAsync).
        int afetadas = await _db.CodigosBeta
            .Where(c => c.Codigo == codigo
                        && c.RevogadoEm == null
                        && c.UsadoPorUsuarioId == null
                        && (c.ExpiraEm == null || c.ExpiraEm > agora))
            .ExecuteUpdateAsync(s => s
                .SetProperty(c => c.UsadoPorUsuarioId, usuarioId)
                .SetProperty(c => c.UsadoEm, agora), ct);

        return afetadas == 1
            ? Result.Success()
            : Result.Failure(CodigoBetaErrors.CodigoInvalido());
    }

    public async Task<bool> RevogarAsync(Guid id, DateTime agora, CancellationToken ct)
    {
        int afetadas = await _db.CodigosBeta
            .Where(c => c.Id == id && c.RevogadoEm == null)
            .ExecuteUpdateAsync(s => s.SetProperty(c => c.RevogadoEm, agora), ct);

        return afetadas == 1;
    }
}
