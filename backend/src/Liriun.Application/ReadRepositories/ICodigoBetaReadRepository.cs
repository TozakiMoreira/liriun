using Liriun.Application.ReadModels;

namespace Liriun.Application.ReadRepositories;

public interface ICodigoBetaReadRepository
{
    Task<IReadOnlyList<CodigoBetaReadModel>> ListarAsync(CancellationToken ct);
}
