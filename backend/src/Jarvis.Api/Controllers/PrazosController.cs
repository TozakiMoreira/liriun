using Jarvis.Application.InputModels.Prazos;
using Jarvis.Application.UseCases.Prazos;
using Jarvis.Application.ViewModels.Prazos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jarvis.Api.Controllers;

[ApiController]
[Authorize]
[Route("prazos")]
public class PrazosController : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PrazoViewModel>>> Listar(
        [FromServices] ListarPrazosUseCase useCase,
        CancellationToken ct)
    {
        IReadOnlyList<PrazoViewModel> lista = await useCase.Executar(ct);
        return Ok(lista);
    }

    [HttpPost]
    public async Task<ActionResult<PrazoViewModel>> Criar(
        [FromBody] CriarPrazoInput input,
        [FromServices] CriarPrazoUseCase useCase,
        CancellationToken ct)
    {
        PrazoViewModel prazo = await useCase.Executar(input, ct);
        return Created($"/prazos/{prazo.Id}", prazo);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<PrazoViewModel>> Atualizar(
        [FromRoute] Guid id,
        [FromBody] AtualizarPrazoInput input,
        [FromServices] AtualizarPrazoUseCase useCase,
        CancellationToken ct)
    {
        PrazoViewModel prazo = await useCase.Executar(id, input, ct);
        return Ok(prazo);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Remover(
        [FromRoute] Guid id,
        [FromServices] RemoverPrazoUseCase useCase,
        CancellationToken ct)
    {
        await useCase.Executar(id, ct);
        return NoContent();
    }
}
