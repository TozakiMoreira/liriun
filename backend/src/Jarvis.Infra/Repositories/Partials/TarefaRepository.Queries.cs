using Jarvis.Core.Entities;
using Jarvis.Core.Enums;
using Microsoft.EntityFrameworkCore;

namespace Jarvis.Infra.Repositories;

public partial class TarefaRepository
{
    public Task<Tarefa?> ObterPorIdAsync(Guid id, Guid usuarioId, CancellationToken ct = default)
        => _db.Tarefas
            .Include(t => t.Categorias)
            .FirstOrDefaultAsync(t => t.Id == id && t.UsuarioId == usuarioId, ct);

    public async Task<IReadOnlyList<Tarefa>> ListarPendentesAsync(Guid usuarioId, CancellationToken ct = default)
        => await _db.Tarefas.AsNoTracking()
            .Include(t => t.Categorias)
            .Where(t => t.UsuarioId == usuarioId && t.Status == StatusTarefa.Pendente)
            .OrderBy(t => t.DataPrazo ?? DateTime.MaxValue)
            .ThenBy(t => t.Prioridade)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<Tarefa>> ListarConcluidasAsync(Guid usuarioId, DateTime? de, DateTime? ate, CancellationToken ct = default)
    {
        var query = _db.Tarefas.AsNoTracking()
            .Include(t => t.Categorias)
            .Where(t => t.UsuarioId == usuarioId && t.Status == StatusTarefa.Concluida);

        if (de.HasValue)
            query = query.Where(t => t.ConcluidaEm >= de.Value);

        if (ate.HasValue)
            query = query.Where(t => t.ConcluidaEm <= ate.Value);

        return await query.OrderByDescending(t => t.ConcluidaEm).ToListAsync(ct);
    }
}
