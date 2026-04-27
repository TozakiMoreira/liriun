using Jarvis.Core.Entities;

namespace Jarvis.Core.Interfaces.Repositories;

public interface ICategoriaRepository
{
    Task<Categoria?> ObterPorIdAsync(Guid id, Guid usuarioId, CancellationToken ct);
    Task<Categoria> AdicionarAsync(Categoria categoria, CancellationToken ct);
    Task<Categoria> AtualizarAsync(Categoria categoria, CancellationToken ct);
    Task RemoverAsync(Categoria categoria, CancellationToken ct);
}
