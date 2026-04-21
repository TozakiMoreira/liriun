using Jarvis.Core.Entities;
using Jarvis.Core.Enums;
using Microsoft.EntityFrameworkCore;

namespace Jarvis.Infra.Repositories;

public partial class PrazoRepository
{
    public Task<Prazo?> ObterPorIdAsync(Guid id, Guid usuarioId, CancellationToken ct = default)
        => _db.Prazos.FirstOrDefaultAsync(p => p.Id == id && p.UsuarioId == usuarioId, ct);

    public async Task<IReadOnlyList<Prazo>> ListarPorUsuarioAsync(Guid usuarioId, CancellationToken ct = default)
        => await _db.Prazos.AsNoTracking()
            .Where(p => p.UsuarioId == usuarioId)
            .OrderBy(p => p.DuracaoDias ?? int.MaxValue)
            .ThenBy(p => p.Nome)
            .ToListAsync(ct);

    public Task<bool> ExisteNomeAsync(Guid usuarioId, string nome, CancellationToken ct = default)
    {
        var n = nome.Trim();
        return _db.Prazos.AnyAsync(p => p.UsuarioId == usuarioId && p.Nome == n, ct);
    }

    public Task<bool> TemTarefaPendenteAsync(Guid prazoId, CancellationToken ct = default)
        => _db.Tarefas.AnyAsync(t => t.PrazoId == prazoId && t.Status == StatusTarefa.Pendente, ct);
}
