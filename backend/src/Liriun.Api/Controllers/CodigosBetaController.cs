using Liriun.Api.Extensions;
using Liriun.Application.InputModels.Admin;
using Liriun.Application.UseCases.Admin;
using Liriun.Application.ViewModels.Admin;
using Liriun.Core.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Liriun.Api.Controllers;

[ApiController]
[Authorize(Policy = "Admin")]
[Route("admin/codigos-beta")]
public class CodigosBetaController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar(
        [FromServices] ListarCodigosBetaUseCase useCase,
        CancellationToken ct)
    {
        Result<IReadOnlyList<CodigoBetaViewModel>> result = await useCase.ExecuteAsync(ct);
        return result.ToActionResult(lista => Ok(lista));
    }

    [HttpPost]
    public async Task<IActionResult> Gerar(
        [FromBody] GerarCodigoBetaInput? input,
        [FromServices] GerarCodigoBetaUseCase useCase,
        CancellationToken ct)
    {
        Result<IReadOnlyList<CodigoBetaViewModel>> result = await useCase.ExecuteAsync(input ?? new GerarCodigoBetaInput(), ct);
        return result.ToActionResult(lista => Created("/admin/codigos-beta", lista));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Revogar(
        [FromRoute] Guid id,
        [FromServices] RevogarCodigoBetaUseCase useCase,
        CancellationToken ct)
    {
        Result result = await useCase.ExecuteAsync(id, ct);
        return result.ToActionResult(() => NoContent());
    }
}
