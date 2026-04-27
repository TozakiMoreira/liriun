using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ReadRepositories;
using Jarvis.Core.Common;
using Jarvis.Core.Entities;
using Jarvis.Core.Errors;
using Jarvis.Core.Interfaces.Repositories;

namespace Jarvis.Application.UseCases.Categorias;

public class RemoverCategoriaUseCase
{
    private readonly ICategoriaRepository _categorias;
    private readonly ICategoriaReadRepository _categoriaRead;
    private readonly IUsuarioLogado _usuarioLogado;

    public RemoverCategoriaUseCase(
        ICategoriaRepository categorias,
        ICategoriaReadRepository categoriaRead,
        IUsuarioLogado usuarioLogado)
    {
        _categorias = categorias;
        _categoriaRead = categoriaRead;
        _usuarioLogado = usuarioLogado;
    }

    public async Task<Result> ExecuteAsync(Guid id, CancellationToken ct)
    {
        Categoria? categoria = await _categorias.ObterPorIdAsync(id, _usuarioLogado.Id, ct);
        if (categoria is null)
            return Result.Failure(CategoriaErrors.NaoEncontrada());

        if (await _categoriaRead.TemTarefaPendenteAsync(categoria.Id, ct))
            return Result.Failure(CategoriaErrors.PossuiTarefasPendentes());

        await _categorias.RemoverAsync(categoria, ct);
        return Result.Success();
    }
}
