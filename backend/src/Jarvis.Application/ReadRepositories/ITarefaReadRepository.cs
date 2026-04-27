using Jarvis.Application.ReadModels;

namespace Jarvis.Application.ReadRepositories;

public interface ITarefaReadRepository
{
    Task<IReadOnlyList<TarefaReadModel>> ListarPendentesAsync(Guid usuarioId, CancellationToken ct);
    Task<IReadOnlyList<TarefaReadModel>> ListarConcluidasAsync(Guid usuarioId, DateTime? de, DateTime? ate, CancellationToken ct);
}
