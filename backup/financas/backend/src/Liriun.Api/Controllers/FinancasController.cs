using Liriun.Api.Extensions;
using Liriun.Application.InputModels.Lancamentos;
using Liriun.Application.UseCases.Lancamentos;
using Liriun.Application.ViewModels.Lancamentos;
using Liriun.Core.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Liriun.Api.Controllers;

[ApiController]
[Authorize]
[Route("financas")]
public class FinancasController : ControllerBase
{
    [HttpGet("lancamentos")]
    public async Task<IActionResult> Listar(
        [FromServices] ListarLancamentosUseCase useCase,
        [FromQuery] int? ano,
        [FromQuery] int? mes,
        CancellationToken ct)
    {
        Result<IReadOnlyList<LancamentoViewModel>> result = await useCase.ExecuteAsync(ano, mes, ct);
        return result.ToActionResult(lista => Ok(lista));
    }

    [HttpPost("lancamentos")]
    public async Task<IActionResult> Criar(
        [FromBody] CriarLancamentoInput input,
        [FromServices] CriarLancamentoUseCase useCase,
        CancellationToken ct)
    {
        Result<LancamentoViewModel> result = await useCase.ExecuteAsync(input, ct);
        return result.ToActionResult(view => Created($"/financas/lancamentos/{view.Id}", view));
    }

    [HttpPut("lancamentos/{id:guid}")]
    public async Task<IActionResult> Atualizar(
        [FromRoute] Guid id,
        [FromBody] AtualizarLancamentoInput input,
        [FromServices] AtualizarLancamentoUseCase useCase,
        CancellationToken ct)
    {
        Result<LancamentoViewModel> result = await useCase.ExecuteAsync(id, input, ct);
        return result.ToActionResult(view => Ok(view));
    }

    [HttpDelete("lancamentos/{id:guid}")]
    public async Task<IActionResult> Remover(
        [FromRoute] Guid id,
        [FromServices] RemoverLancamentoUseCase useCase,
        CancellationToken ct)
    {
        Result result = await useCase.ExecuteAsync(id, ct);
        return result.ToActionResult(() => NoContent());
    }

    [HttpPost("lancamentos/{id:guid}/pagar")]
    public async Task<IActionResult> MarcarPago(
        [FromRoute] Guid id,
        [FromServices] MarcarPagoUseCase useCase,
        CancellationToken ct)
    {
        Result<LancamentoViewModel> result = await useCase.ExecuteAsync(id, ct);
        return result.ToActionResult(view => Ok(view));
    }

    [HttpPost("lancamentos/{id:guid}/desfazer-pagamento")]
    public async Task<IActionResult> DesfazerPagamento(
        [FromRoute] Guid id,
        [FromServices] DesfazerPagamentoUseCase useCase,
        CancellationToken ct)
    {
        Result<LancamentoViewModel> result = await useCase.ExecuteAsync(id, ct);
        return result.ToActionResult(view => Ok(view));
    }

    [HttpGet("balanco")]
    public async Task<IActionResult> Balanco(
        [FromServices] ObterBalancoUseCase useCase,
        [FromQuery] int? ano,
        [FromQuery] int? mes,
        CancellationToken ct)
    {
        int anoEfetivo = ano ?? DateTime.UtcNow.Year;
        Result<BalancoViewModel> result = await useCase.ExecuteAsync(anoEfetivo, mes, ct);
        return result.ToActionResult(view => Ok(view));
    }

    [HttpGet("lancamentos/{id:guid}/anexo")]
    public async Task<IActionResult> ObterAnexo(
        [FromRoute] Guid id,
        [FromServices] ObterAnexoUseCase useCase,
        CancellationToken ct)
    {
        Result<string> result = await useCase.ExecuteAsync(id, ct);
        return result.ToActionResult(anexo => Ok(new { anexo }));
    }
}
