using Jarvis.Core.Entities;
using Jarvis.Core.Enums;
using Microsoft.EntityFrameworkCore;

namespace Jarvis.Infra.Repositories;

public partial class CategoriaRepository
{
    public Task<Categoria?> ObterPorId(Guid id, Guid usuarioId, CancellationToken ct = default)
        => _db.Categorias.FirstOrDefaultAsync(c => c.Id == id && c.UsuarioId == usuarioId, ct);

    public async Task<IReadOnlyList<Categoria>> ListarPorUsuario(Guid usuarioId, CancellationToken ct = default)
        => await _db.Categorias.AsNoTracking()
            .Where(c => c.UsuarioId == usuarioId)
            .OrderBy(c => c.Nome)
            .ToListAsync(ct);

    public async Task<bool> TodasPertencemAoUsuario(IEnumerable<Guid> ids, Guid usuarioId, CancellationToken ct = default)
    {
        var lista = ids.Distinct().ToList();
        if (lista.Count == 0) return true;

        int encontradas = await _db.Categorias.AsNoTracking()
            .CountAsync(c => c.UsuarioId == usuarioId && lista.Contains(c.Id), ct);

        return encontradas == lista.Count;
    }

    public Task<bool> ExisteNome(Guid usuarioId, string nome, CancellationToken ct = default)
    {
        var n = nome.Trim().ToLower();
        return _db.Categorias.AnyAsync(
            c => c.UsuarioId == usuarioId && c.Nome.ToLower() == n, ct);
    }

    public Task<bool> ExisteOutraComNome(Guid usuarioId, string nome, Guid excetoId, CancellationToken ct = default)
    {
        var n = nome.Trim().ToLower();
        return _db.Categorias.AnyAsync(
            c => c.UsuarioId == usuarioId && c.Id != excetoId && c.Nome.ToLower() == n, ct);
    }

    public Task<bool> TemTarefaPendente(Guid categoriaId, CancellationToken ct = default)
        => _db.TarefasCategorias
            .AnyAsync(tc => tc.CategoriaId == categoriaId &&
                            _db.Tarefas.Any(t => t.Id == tc.TarefaId && t.Status == StatusTarefa.Pendente), ct);
}
