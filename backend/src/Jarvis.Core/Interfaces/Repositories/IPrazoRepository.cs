using Jarvis.Core.Entities;

namespace Jarvis.Core.Interfaces.Repositories;

public interface IPrazoRepository
{
    Task<Prazo?> ObterPorIdAsync(Guid id, Guid usuarioId, CancellationToken ct);
    Task<Prazo> AdicionarAsync(Prazo prazo, CancellationToken ct);
    Task<Prazo> AtualizarAsync(Prazo prazo, CancellationToken ct);
    Task RemoverAsync(Prazo prazo, CancellationToken ct);
}
