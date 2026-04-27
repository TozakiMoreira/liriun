using Jarvis.Core.Entities;
using Jarvis.Core.Interfaces.Repositories;
using Jarvis.Infrastructure.Persistence;
using Jarvis.Infrastructure.Persistence.Mappers;
using Jarvis.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace Jarvis.Infrastructure.Repositories;

public class PrazoRepository : IPrazoRepository
{
    private readonly JarvisDbContext _db;

    public PrazoRepository(JarvisDbContext db)
    {
        _db = db;
    }

    public async Task<Prazo?> ObterPorIdAsync(Guid id, Guid usuarioId, CancellationToken ct)
    {
        PrazoModel? model = await _db.Prazos.AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id && p.UsuarioId == usuarioId, ct);
        return model is null ? null : PrazoMapper.ToEntity(model);
    }

    public async Task<Prazo> AdicionarAsync(Prazo prazo, CancellationToken ct)
    {
        PrazoModel model = PrazoMapper.ToModel(prazo);
        await _db.Prazos.AddAsync(model, ct);
        await _db.SaveChangesAsync(ct);
        return prazo;
    }

    public async Task<Prazo> AtualizarAsync(Prazo prazo, CancellationToken ct)
    {
        PrazoModel model = PrazoMapper.ToModel(prazo);
        _db.Prazos.Update(model);
        await _db.SaveChangesAsync(ct);
        return prazo;
    }

    public async Task RemoverAsync(Prazo prazo, CancellationToken ct)
    {
        PrazoModel model = PrazoMapper.ToModel(prazo);
        _db.Prazos.Remove(model);
        await _db.SaveChangesAsync(ct);
    }
}
