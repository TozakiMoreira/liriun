using Jarvis.Api.Extensions;
using Jarvis.Application.InputModels.Categorias;
using Jarvis.Application.UseCases.Categorias;
using Jarvis.Application.ViewModels.Categorias;
using Jarvis.Core.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jarvis.Api.Controllers;

[ApiController]
[Authorize]
[Route("categorias")]
public class CategoriasController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar(
        [FromServices] ListarCategoriasUseCase useCase,
        CancellationToken ct)
    {
        Result<IReadOnlyList<CategoriaViewModel>> result = await useCase.ExecuteAsync(ct);
        return result.ToActionResult(lista => Ok(lista));
    }

    [HttpPost]
    public async Task<IActionResult> Criar(
        [FromBody] CriarCategoriaInput input,
        [FromServices] CriarCategoriaUseCase useCase,
        CancellationToken ct)
    {
        Result<CategoriaViewModel> result = await useCase.ExecuteAsync(input, ct);
        return result.ToActionResult(view => Created($"/categorias/{view.Id}", view));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Atualizar(
        [FromRoute] Guid id,
        [FromBody] AtualizarCategoriaInput input,
        [FromServices] AtualizarCategoriaUseCase useCase,
        CancellationToken ct)
    {
        Result<CategoriaViewModel> result = await useCase.ExecuteAsync(id, input, ct);
        return result.ToActionResult(view => Ok(view));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Remover(
        [FromRoute] Guid id,
        [FromServices] RemoverCategoriaUseCase useCase,
        CancellationToken ct)
    {
        Result result = await useCase.ExecuteAsync(id, ct);
        return result.ToActionResult(() => NoContent());
    }
}
