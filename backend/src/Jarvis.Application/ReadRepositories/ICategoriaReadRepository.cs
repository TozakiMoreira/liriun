using Jarvis.Application.ReadModels;

namespace Jarvis.Application.ReadRepositories;

public interface ICategoriaReadRepository
{
    Task<IReadOnlyList<CategoriaReadModel>> ListarPorUsuarioAsync(Guid usuarioId, CancellationToken ct);
    Task<bool> ExisteNomeAsync(Guid usuarioId, string nome, CancellationToken ct);
    Task<bool> ExisteOutraComNomeAsync(Guid usuarioId, string nome, Guid excetoId, CancellationToken ct);
    Task<bool> TodasPertencemAoUsuarioAsync(IEnumerable<Guid> ids, Guid usuarioId, CancellationToken ct);
    Task<bool> TemTarefaPendenteAsync(Guid categoriaId, CancellationToken ct);
}
