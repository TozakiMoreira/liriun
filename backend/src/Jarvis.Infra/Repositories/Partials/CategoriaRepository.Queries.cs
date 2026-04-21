using Jarvis.Core.Entities;
using Jarvis.Core.Enums;
using Microsoft.EntityFrameworkCore;

namespace Jarvis.Infra.Repositories;

public partial class CategoriaRepository
{
    public Task<Categoria?> ObterPorIdAsync(Guid id, Guid usuarioId, CancellationToken ct = default)
        => _db.Categorias.FirstOrDefaultAsync(c => c.Id == id && c.UsuarioId == usuarioId, ct);

    public async Task<IReadOnlyList<Categoria>> ListarPorUsuarioAsync(Guid usuarioId, CancellationToken ct = default)
        => await _db.Categorias.AsNoTracking()
            .Where(c => c.UsuarioId == usuarioId)
            .OrderBy(c => c.Nome)
            .ToListAsync(ct);

    public Task<bool> ExisteNomeAsync(Guid usuarioId, string nome, CancellationToken ct = default)
    {
        var n = nome.Trim();
        return _db.Categorias.AnyAsync(c => c.UsuarioId == usuarioId && c.Nome == n, ct);
    }

    public Task<bool> TemTarefaPendenteAsync(Guid categoriaId, CancellationToken ct = default)
        => _db.TarefasCategorias
            .AnyAsync(tc => tc.CategoriaId == categoriaId &&
                            _db.Tarefas.Any(t => t.Id == tc.TarefaId && t.Status == StatusTarefa.Pendente), ct);
}
