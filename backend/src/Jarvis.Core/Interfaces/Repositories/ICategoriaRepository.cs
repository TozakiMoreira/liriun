using Jarvis.Core.Entities;

namespace Jarvis.Core.Interfaces.Repositories;

public interface ICategoriaRepository
{
    Task<Categoria?> ObterPorIdAsync(Guid id, Guid usuarioId, CancellationToken ct = default);
    Task<IReadOnlyList<Categoria>> ListarPorUsuarioAsync(Guid usuarioId, CancellationToken ct = default);
    Task<bool> ExisteNomeAsync(Guid usuarioId, string nome, CancellationToken ct = default);
    Task<bool> TemTarefaPendenteAsync(Guid categoriaId, CancellationToken ct = default);
    Task AdicionarAsync(Categoria categoria, CancellationToken ct = default);
    Task AtualizarAsync(Categoria categoria, CancellationToken ct = default);
    Task RemoverAsync(Categoria categoria, CancellationToken ct = default);
}
