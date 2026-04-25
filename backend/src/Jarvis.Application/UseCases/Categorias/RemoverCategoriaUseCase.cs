using Jarvis.Application.Interfaces.Auth;
using Jarvis.Core.Entities;
using Jarvis.Core.Exceptions;
using Jarvis.Core.Interfaces.Repositories;

namespace Jarvis.Application.UseCases.Categorias;

public class RemoverCategoriaUseCase
{
    private readonly ICategoriaRepository _categorias;
    private readonly IUsuarioLogado _usuarioLogado;

    public RemoverCategoriaUseCase(ICategoriaRepository categorias, IUsuarioLogado usuarioLogado)
    {
        _categorias = categorias;
        _usuarioLogado = usuarioLogado;
    }

    public async Task Executar(Guid id, CancellationToken ct = default)
    {
        Categoria categoria = await _categorias.ObterPorId(id, _usuarioLogado.Id, ct)
            ?? throw new ApplicationLayerException("Categoria não encontrada", 404);

        if (await _categorias.TemTarefaPendente(categoria.Id, ct))
            throw new ApplicationLayerException("Categoria possui tarefas pendentes vinculadas. Conclua ou remova as tarefas antes de excluir a categoria.", 409);

        await _categorias.Remover(categoria, ct);
    }
}
