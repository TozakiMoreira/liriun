using Jarvis.Application.ReadModels;

namespace Jarvis.Application.ReadRepositories;

public interface IPrazoReadRepository
{
    Task<IReadOnlyList<PrazoReadModel>> ListarPorUsuarioAsync(Guid usuarioId, CancellationToken ct);
    Task<bool> ExisteNomeAsync(Guid usuarioId, string nome, CancellationToken ct);
    Task<bool> ExisteOutraComNomeAsync(Guid usuarioId, string nome, Guid excetoId, CancellationToken ct);
    Task<bool> TemTarefaPendenteAsync(Guid prazoId, CancellationToken ct);
}
