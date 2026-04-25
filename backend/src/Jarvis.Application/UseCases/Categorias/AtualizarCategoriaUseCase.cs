using Jarvis.Application.InputModels.Categorias;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ViewModels.Categorias;
using Jarvis.Core.Entities;
using Jarvis.Core.Exceptions;
using Jarvis.Core.Interfaces.Repositories;

namespace Jarvis.Application.UseCases.Categorias;

public class AtualizarCategoriaUseCase
{
    private readonly ICategoriaRepository _categorias;
    private readonly IUsuarioLogado _usuarioLogado;

    public AtualizarCategoriaUseCase(ICategoriaRepository categorias, IUsuarioLogado usuarioLogado)
    {
        _categorias = categorias;
        _usuarioLogado = usuarioLogado;
    }

    public async Task<CategoriaViewModel> Executar(Guid id, AtualizarCategoriaInput input, CancellationToken ct = default)
    {
        Categoria categoria = await _categorias.ObterPorId(id, _usuarioLogado.Id, ct)
            ?? throw new ApplicationLayerException("Categoria não encontrada", 404);

        if (await _categorias.ExisteOutraComNome(_usuarioLogado.Id, input.Nome, id, ct))
            throw new ApplicationLayerException("Já existe uma categoria com esse nome", 409);

        categoria.Renomear(input.Nome);
        await _categorias.Atualizar(categoria, ct);

        return CategoriaViewModel.From(categoria);
    }
}
