using Liriun.Core.Entities;

namespace Liriun.Core.Interfaces.Repositories;

public interface ILancamentoRepository
{
    Task<Lancamento?> ObterPorIdAsync(Guid id, Guid usuarioId, CancellationToken ct);
    Task<Lancamento> AdicionarAsync(Lancamento lancamento, CancellationToken ct);
    Task<Lancamento> AtualizarAsync(Lancamento lancamento, CancellationToken ct);
    Task RemoverAsync(Lancamento lancamento, CancellationToken ct);
}
