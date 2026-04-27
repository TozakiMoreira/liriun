using Jarvis.Application.ReadModels;
using Jarvis.Application.ReadRepositories;
using Jarvis.Core.Enums;
using Jarvis.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Jarvis.Infrastructure.ReadRepositories;

public class CategoriaReadRepository : ICategoriaReadRepository
{
    private readonly JarvisDbContext _db;

    public CategoriaReadRepository(JarvisDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<CategoriaReadModel>> ListarPorUsuarioAsync(Guid usuarioId, CancellationToken ct)
        => await _db.Categorias.AsNoTracking()
            .Where(c => c.UsuarioId == usuarioId)
            .OrderBy(c => c.Nome)
            .Select(c => new CategoriaReadModel(c.Id, c.Nome, c.CriadaEm))
            .ToListAsync(ct);

    public Task<bool> ExisteNomeAsync(Guid usuarioId, string nome, CancellationToken ct)
    {
        string n = nome.Trim().ToLower();
        return _db.Categorias.AsNoTracking()
            .AnyAsync(c => c.UsuarioId == usuarioId && c.Nome.ToLower() == n, ct);
    }

    public Task<bool> ExisteOutraComNomeAsync(Guid usuarioId, string nome, Guid excetoId, CancellationToken ct)
    {
        string n = nome.Trim().ToLower();
        return _db.Categorias.AsNoTracking()
            .AnyAsync(c => c.UsuarioId == usuarioId && c.Id != excetoId && c.Nome.ToLower() == n, ct);
    }

    public async Task<bool> TodasPertencemAoUsuarioAsync(IEnumerable<Guid> ids, Guid usuarioId, CancellationToken ct)
    {
        List<Guid> lista = ids.Distinct().ToList();
        if (lista.Count == 0) return true;

        int encontradas = await _db.Categorias.AsNoTracking()
            .CountAsync(c => c.UsuarioId == usuarioId && lista.Contains(c.Id), ct);

        return encontradas == lista.Count;
    }

    public Task<bool> TemTarefaPendenteAsync(Guid categoriaId, CancellationToken ct)
        => _db.TarefasCategorias.AsNoTracking()
            .AnyAsync(tc => tc.CategoriaId == categoriaId &&
                            _db.Tarefas.Any(t => t.Id == tc.TarefaId && t.Status == StatusTarefa.Pendente), ct);
}
