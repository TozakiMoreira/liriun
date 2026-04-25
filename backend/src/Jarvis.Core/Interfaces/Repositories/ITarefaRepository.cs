using Jarvis.Core.Entities;
using Jarvis.Core.Enums;

namespace Jarvis.Core.Interfaces.Repositories;

public interface ITarefaRepository
{
    Task<Tarefa?> ObterPorId(Guid id, Guid usuarioId, CancellationToken ct = default);
    Task<IReadOnlyList<Tarefa>> ListarPendentes(Guid usuarioId, CancellationToken ct = default);
    Task<IReadOnlyList<Tarefa>> ListarConcluidas(Guid usuarioId, DateTime? de, DateTime? ate, CancellationToken ct = default);
    Task Adicionar(Tarefa tarefa, IEnumerable<Guid> categoriaIds, CancellationToken ct = default);
    Task Atualizar(Tarefa tarefa, IEnumerable<Guid> categoriaIds, CancellationToken ct = default);
    Task Concluir(Tarefa tarefa, CancellationToken ct = default);
    Task Remover(Tarefa tarefa, CancellationToken ct = default);
}
