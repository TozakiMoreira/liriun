using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ViewModels.Categorias;
using Jarvis.Core.Entities;
using Jarvis.Core.Interfaces.Repositories;

namespace Jarvis.Application.UseCases.Categorias;

public class ListarCategoriasUseCase
{
    private readonly ICategoriaRepository _categorias;
    private readonly IUsuarioLogado _usuarioLogado;

    public ListarCategoriasUseCase(ICategoriaRepository categorias, IUsuarioLogado usuarioLogado)
    {
        _categorias = categorias;
        _usuarioLogado = usuarioLogado;
    }

    public async Task<IReadOnlyList<CategoriaViewModel>> Executar(CancellationToken ct = default)
    {
        IReadOnlyList<Categoria> lista = await _categorias.ListarPorUsuario(_usuarioLogado.Id, ct);
        return lista.Select(CategoriaViewModel.From).ToList();
    }
}
