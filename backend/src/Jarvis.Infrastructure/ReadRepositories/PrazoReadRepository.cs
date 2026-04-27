using Jarvis.Application.ReadModels;
using Jarvis.Application.ReadRepositories;
using Jarvis.Core.Enums;
using Jarvis.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Jarvis.Infrastructure.ReadRepositories;

public class PrazoReadRepository : IPrazoReadRepository
{
    private readonly JarvisDbContext _db;

    public PrazoReadRepository(JarvisDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<PrazoReadModel>> ListarPorUsuarioAsync(Guid usuarioId, CancellationToken ct)
        => await _db.Prazos.AsNoTracking()
            .Where(p => p.UsuarioId == usuarioId)
            .OrderBy(p => p.DuracaoDias ?? int.MaxValue)
            .ThenBy(p => p.Nome)
            .Select(p => new PrazoReadModel(p.Id, p.Nome, p.DuracaoDias, p.CriadoEm))
            .ToListAsync(ct);

    public Task<bool> ExisteNomeAsync(Guid usuarioId, string nome, CancellationToken ct)
    {
        string n = nome.Trim().ToLower();
        return _db.Prazos.AsNoTracking()
            .AnyAsync(p => p.UsuarioId == usuarioId && p.Nome.ToLower() == n, ct);
    }

    public Task<bool> ExisteOutraComNomeAsync(Guid usuarioId, string nome, Guid excetoId, CancellationToken ct)
    {
        string n = nome.Trim().ToLower();
        return _db.Prazos.AsNoTracking()
            .AnyAsync(p => p.UsuarioId == usuarioId && p.Id != excetoId && p.Nome.ToLower() == n, ct);
    }

    public Task<bool> TemTarefaPendenteAsync(Guid prazoId, CancellationToken ct)
        => _db.Tarefas.AsNoTracking()
            .AnyAsync(t => t.PrazoId == prazoId && t.Status == StatusTarefa.Pendente, ct);
}
