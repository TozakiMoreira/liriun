using Liriun.Application.Interfaces.Auth;
using Liriun.Application.ReadModels;
using Liriun.Application.ReadRepositories;
using Liriun.Application.ViewModels.Categorias;
using Liriun.Core.Common;

namespace Liriun.Application.UseCases.Categorias;

public class ListarCategoriasUseCase
{
    private readonly ICategoriaReadRepository _categoriaRead;
    private readonly IUsuarioLogado _usuarioLogado;

    public ListarCategoriasUseCase(ICategoriaReadRepository categoriaRead, IUsuarioLogado usuarioLogado)
    {
        _categoriaRead = categoriaRead;
        _usuarioLogado = usuarioLogado;
    }

    public async Task<Result<IReadOnlyList<CategoriaViewModel>>> ExecuteAsync(CancellationToken ct)
    {
        IReadOnlyList<CategoriaReadModel> lista = await _categoriaRead.ListarPorUsuarioAsync(_usuarioLogado.Id, ct);
        IReadOnlyList<CategoriaViewModel> viewModels = lista
            .Select(CategoriaViewModel.FromReadModel)
            .ToList();
        return Result<IReadOnlyList<CategoriaViewModel>>.Success(viewModels);
    }
}
