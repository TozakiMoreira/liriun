using Jarvis.Core.Entities;

namespace Jarvis.Core.Interfaces.Repositories;

public interface ICategoriaRepository
{
    Task<Categoria?> ObterPorId(Guid id, Guid usuarioId, CancellationToken ct = default);
    Task<IReadOnlyList<Categoria>> ListarPorUsuario(Guid usuarioId, CancellationToken ct = default);
    Task<bool> TodasPertencemAoUsuario(IEnumerable<Guid> ids, Guid usuarioId, CancellationToken ct = default);
    Task<bool> ExisteNome(Guid usuarioId, string nome, CancellationToken ct = default);
    Task<bool> ExisteOutraComNome(Guid usuarioId, string nome, Guid excetoId, CancellationToken ct = default);
    Task<bool> TemTarefaPendente(Guid categoriaId, CancellationToken ct = default);
    Task Adicionar(Categoria categoria, CancellationToken ct = default);
    Task Atualizar(Categoria categoria, CancellationToken ct = default);
    Task Remover(Categoria categoria, CancellationToken ct = default);
}
