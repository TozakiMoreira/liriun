using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ReadModels;
using Jarvis.Application.ReadRepositories;
using Jarvis.Application.ViewModels.Categorias;
using Jarvis.Core.Common;

namespace Jarvis.Application.UseCases.Categorias;

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
