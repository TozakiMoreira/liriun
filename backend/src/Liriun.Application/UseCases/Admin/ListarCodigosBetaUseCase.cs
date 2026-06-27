using Liriun.Application.ReadModels;
using Liriun.Application.ReadRepositories;
using Liriun.Application.ViewModels.Admin;
using Liriun.Core.Common;

namespace Liriun.Application.UseCases.Admin;

public class ListarCodigosBetaUseCase
{
    private readonly ICodigoBetaReadRepository _read;

    public ListarCodigosBetaUseCase(ICodigoBetaReadRepository read)
    {
        _read = read;
    }

    public async Task<Result<IReadOnlyList<CodigoBetaViewModel>>> ExecuteAsync(CancellationToken ct)
    {
        IReadOnlyList<CodigoBetaReadModel> lista = await _read.ListarAsync(ct);
        IReadOnlyList<CodigoBetaViewModel> view = lista.Select(CodigoBetaViewModel.FromReadModel).ToList();
        return Result<IReadOnlyList<CodigoBetaViewModel>>.Success(view);
    }
}
