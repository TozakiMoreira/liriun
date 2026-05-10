using Liriun.Application.ReadModels;

namespace Liriun.Application.ReadRepositories;

public interface ILancamentoReadRepository
{
    Task<IReadOnlyList<LancamentoReadModel>> ListarAsync(Guid usuarioId, int? ano, int? mes, CancellationToken ct);
    Task<BalancoReadModel> ObterBalancoAsync(Guid usuarioId, int ano, int? mes, CancellationToken ct);
    Task<string?> ObterAnexoAsync(Guid id, Guid usuarioId, CancellationToken ct);
}
