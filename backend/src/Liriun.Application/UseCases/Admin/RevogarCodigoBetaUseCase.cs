using Liriun.Core.Common;
using Liriun.Core.Errors;
using Liriun.Core.Interfaces.Repositories;

namespace Liriun.Application.UseCases.Admin;

public class RevogarCodigoBetaUseCase
{
    private readonly ICodigoBetaRepository _codigos;

    public RevogarCodigoBetaUseCase(ICodigoBetaRepository codigos)
    {
        _codigos = codigos;
    }

    public async Task<Result> ExecuteAsync(Guid id, CancellationToken ct)
    {
        bool revogado = await _codigos.RevogarAsync(id, DateTime.UtcNow, ct);
        return revogado ? Result.Success() : Result.Failure(CodigoBetaErrors.NaoEncontrado());
    }
}
