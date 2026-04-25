using Jarvis.Core.Entities;
using Jarvis.Core.Interfaces.Repositories;
using Jarvis.Infra.Data;

namespace Jarvis.Infra.Repositories;

public partial class PrazoRepository : IPrazoRepository
{
    private readonly JarvisDbContext _db;

    public PrazoRepository(JarvisDbContext db)
    {
        _db = db;
    }

    public async Task Adicionar(Prazo prazo, CancellationToken ct = default)
    {
        await _db.Prazos.AddAsync(prazo, ct);
        await _db.SaveChangesAsync(ct);
    }

    public async Task Atualizar(Prazo prazo, CancellationToken ct = default)
    {
        _db.Prazos.Update(prazo);
        await _db.SaveChangesAsync(ct);
    }

    public async Task Remover(Prazo prazo, CancellationToken ct = default)
    {
        _db.Prazos.Remove(prazo);
        await _db.SaveChangesAsync(ct);
    }
}
