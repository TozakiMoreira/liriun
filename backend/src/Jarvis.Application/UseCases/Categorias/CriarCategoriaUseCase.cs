using Jarvis.Application.InputModels.Categorias;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ViewModels.Categorias;
using Jarvis.Core.Entities;
using Jarvis.Core.Exceptions;
using Jarvis.Core.Interfaces.Repositories;

namespace Jarvis.Application.UseCases.Categorias;

public class CriarCategoriaUseCase
{
    private readonly ICategoriaRepository _categorias;
    private readonly IUsuarioLogado _usuarioLogado;

    public CriarCategoriaUseCase(ICategoriaRepository categorias, IUsuarioLogado usuarioLogado)
    {
        _categorias = categorias;
        _usuarioLogado = usuarioLogado;
    }

    public async Task<CategoriaViewModel> Executar(CriarCategoriaInput input, CancellationToken ct = default)
    {
        if (await _categorias.ExisteNome(_usuarioLogado.Id, input.Nome, ct))
            throw new ApplicationLayerException("Já existe uma categoria com esse nome", 409);

        Categoria categoria = new(_usuarioLogado.Id, input.Nome);
        await _categorias.Adicionar(categoria, ct);

        return CategoriaViewModel.From(categoria);
    }
}
