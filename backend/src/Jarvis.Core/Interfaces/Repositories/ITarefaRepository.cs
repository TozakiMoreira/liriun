using Jarvis.Core.Entities;
using Jarvis.Core.Enums;

namespace Jarvis.Core.Interfaces.Repositories;

public interface ITarefaRepository
{
    Task<Tarefa?> ObterPorIdAsync(Guid id, Guid usuarioId, CancellationToken ct = default);
    Task<IReadOnlyList<Tarefa>> ListarPendentesAsync(Guid usuarioId, CancellationToken ct = default);
    Task<IReadOnlyList<Tarefa>> ListarConcluidasAsync(Guid usuarioId, DateTime? de, DateTime? ate, CancellationToken ct = default);
    Task AdicionarAsync(Tarefa tarefa, IEnumerable<Guid> categoriaIds, CancellationToken ct = default);
    Task AtualizarAsync(Tarefa tarefa, IEnumerable<Guid> categoriaIds, CancellationToken ct = default);
    Task ConcluirAsync(Tarefa tarefa, CancellationToken ct = default);
    Task RemoverAsync(Tarefa tarefa, CancellationToken ct = default);
}
