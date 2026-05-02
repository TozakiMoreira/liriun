using Jarvis.Api.Extensions;
using Jarvis.Application.InputModels.Ia;
using Jarvis.Application.UseCases.Ia;
using Jarvis.Application.ViewModels.Ia;
using Jarvis.Core.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jarvis.Api.Controllers;

[ApiController]
[Authorize]
[Route("captura")]
public class CapturaController : ControllerBase
{
    [HttpPost("conversar")]
    public async Task<IActionResult> Conversar(
        [FromBody] ConversarCapturaInput input,
        [FromServices] ConversarCapturaUseCase useCase,
        CancellationToken ct)
    {
        Result<ConversaCapturaViewModel> result = await useCase.ExecuteAsync(input, ct);
        return result.ToActionResult(view => Ok(view));
    }
}
