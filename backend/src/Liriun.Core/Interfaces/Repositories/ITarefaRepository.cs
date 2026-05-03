using Liriun.Core.Entities;

namespace Liriun.Core.Interfaces.Repositories;

public interface ITarefaRepository
{
    Task<Tarefa?> ObterPorIdAsync(Guid id, Guid usuarioId, CancellationToken ct);
    Task<Tarefa> AdicionarAsync(Tarefa tarefa, IEnumerable<Guid> categoriaIds, CancellationToken ct);
    Task<Tarefa> AtualizarAsync(Tarefa tarefa, IEnumerable<Guid> categoriaIds, CancellationToken ct);
    Task RemoverAsync(Tarefa tarefa, CancellationToken ct);
}
