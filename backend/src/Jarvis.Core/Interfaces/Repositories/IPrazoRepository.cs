using Jarvis.Core.Entities;

namespace Jarvis.Core.Interfaces.Repositories;

public interface IPrazoRepository
{
    Task<Prazo?> ObterPorIdAsync(Guid id, Guid usuarioId, CancellationToken ct = default);
    Task<IReadOnlyList<Prazo>> ListarPorUsuarioAsync(Guid usuarioId, CancellationToken ct = default);
    Task<bool> ExisteNomeAsync(Guid usuarioId, string nome, CancellationToken ct = default);
    Task<bool> TemTarefaPendenteAsync(Guid prazoId, CancellationToken ct = default);
    Task AdicionarAsync(Prazo prazo, CancellationToken ct = default);
    Task AtualizarAsync(Prazo prazo, CancellationToken ct = default);
    Task RemoverAsync(Prazo prazo, CancellationToken ct = default);
}
