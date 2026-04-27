using Jarvis.Api.Extensions;
using Jarvis.Application.InputModels.Prazos;
using Jarvis.Application.UseCases.Prazos;
using Jarvis.Application.ViewModels.Prazos;
using Jarvis.Core.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jarvis.Api.Controllers;

[ApiController]
[Authorize]
[Route("prazos")]
public class PrazosController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar(
        [FromServices] ListarPrazosUseCase useCase,
        CancellationToken ct)
    {
        Result<IReadOnlyList<PrazoViewModel>> result = await useCase.ExecuteAsync(ct);
        return result.ToActionResult(lista => Ok(lista));
    }

    [HttpPost]
    public async Task<IActionResult> Criar(
        [FromBody] CriarPrazoInput input,
        [FromServices] CriarPrazoUseCase useCase,
        CancellationToken ct)
    {
        Result<PrazoViewModel> result = await useCase.ExecuteAsync(input, ct);
        return result.ToActionResult(view => Created($"/prazos/{view.Id}", view));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Atualizar(
        [FromRoute] Guid id,
        [FromBody] AtualizarPrazoInput input,
        [FromServices] AtualizarPrazoUseCase useCase,
        CancellationToken ct)
    {
        Result<PrazoViewModel> result = await useCase.ExecuteAsync(id, input, ct);
        return result.ToActionResult(view => Ok(view));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Remover(
        [FromRoute] Guid id,
        [FromServices] RemoverPrazoUseCase useCase,
        CancellationToken ct)
    {
        Result result = await useCase.ExecuteAsync(id, ct);
        return result.ToActionResult(() => NoContent());
    }
}
