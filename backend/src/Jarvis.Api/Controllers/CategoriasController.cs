using Jarvis.Application.InputModels.Categorias;
using Jarvis.Application.UseCases.Categorias;
using Jarvis.Application.ViewModels.Categorias;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jarvis.Api.Controllers;

[ApiController]
[Authorize]
[Route("categorias")]
public class CategoriasController : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoriaViewModel>>> Listar(
        [FromServices] ListarCategoriasUseCase useCase,
        CancellationToken ct)
    {
        IReadOnlyList<CategoriaViewModel> lista = await useCase.Executar(ct);
        return Ok(lista);
    }

    [HttpPost]
    public async Task<ActionResult<CategoriaViewModel>> Criar(
        [FromBody] CriarCategoriaInput input,
        [FromServices] CriarCategoriaUseCase useCase,
        CancellationToken ct)
    {
        CategoriaViewModel categoria = await useCase.Executar(input, ct);
        return Created($"/categorias/{categoria.Id}", categoria);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CategoriaViewModel>> Atualizar(
        [FromRoute] Guid id,
        [FromBody] AtualizarCategoriaInput input,
        [FromServices] AtualizarCategoriaUseCase useCase,
        CancellationToken ct)
    {
        CategoriaViewModel categoria = await useCase.Executar(id, input, ct);
        return Ok(categoria);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Remover(
        [FromRoute] Guid id,
        [FromServices] RemoverCategoriaUseCase useCase,
        CancellationToken ct)
    {
        await useCase.Executar(id, ct);
        return NoContent();
    }
}
