using Liriun.Application.Interfaces.Auth;
using Liriun.Application.ReadRepositories;
using Liriun.Core.Common;
using Liriun.Core.Entities;
using Liriun.Core.Errors;
using Liriun.Core.Interfaces.Repositories;

namespace Liriun.Application.UseCases.Categorias;

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
