using Jarvis.Core.Entities;

namespace Jarvis.Core.Interfaces.Repositories;

public interface IPrazoRepository
{
    Task<Prazo?> ObterPorId(Guid id, Guid usuarioId, CancellationToken ct = default);
    Task<IReadOnlyList<Prazo>> ListarPorUsuario(Guid usuarioId, CancellationToken ct = default);
    Task<bool> ExisteNome(Guid usuarioId, string nome, CancellationToken ct = default);
    Task<bool> ExisteOutraComNome(Guid usuarioId, string nome, Guid excetoId, CancellationToken ct = default);
    Task<bool> TemTarefaPendente(Guid prazoId, CancellationToken ct = default);
    Task Adicionar(Prazo prazo, CancellationToken ct = default);
    Task Atualizar(Prazo prazo, CancellationToken ct = default);
    Task Remover(Prazo prazo, CancellationToken ct = default);
}
