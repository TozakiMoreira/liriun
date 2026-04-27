using Jarvis.Api.Extensions;
using Jarvis.Application.InputModels.Tarefas;
using Jarvis.Application.UseCases.Tarefas;
using Jarvis.Application.ViewModels.Tarefas;
using Jarvis.Core.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jarvis.Api.Controllers;

[ApiController]
[Authorize]
[Route("tarefas")]
public class TarefasController : ControllerBase
{
    [HttpGet("pendentes")]
    public async Task<IActionResult> ListarPendentes(
        [FromServices] ListarTarefasPendentesUseCase useCase,
        CancellationToken ct)
    {
        Result<IReadOnlyList<TarefaViewModel>> result = await useCase.ExecuteAsync(ct);
        return result.ToActionResult(lista => Ok(lista));
    }

    [HttpGet("concluidas")]
    public async Task<IActionResult> ListarConcluidas(
        [FromServices] ListarTarefasConcluidasUseCase useCase,
        [FromQuery] DateTime? de,
        [FromQuery] DateTime? ate,
        CancellationToken ct)
    {
        Result<IReadOnlyList<TarefaViewModel>> result = await useCase.ExecuteAsync(de, ate, ct);
        return result.ToActionResult(lista => Ok(lista));
    }

    [HttpPost]
    public async Task<IActionResult> Criar(
        [FromBody] CriarTarefaInput input,
        [FromServices] CriarTarefaUseCase useCase,
        CancellationToken ct)
    {
        Result<TarefaViewModel> result = await useCase.ExecuteAsync(input, ct);
        return result.ToActionResult(view => Created($"/tarefas/{view.Id}", view));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Atualizar(
        [FromRoute] Guid id,
        [FromBody] AtualizarTarefaInput input,
        [FromServices] AtualizarTarefaUseCase useCase,
        CancellationToken ct)
    {
        Result<TarefaViewModel> result = await useCase.ExecuteAsync(id, input, ct);
        return result.ToActionResult(view => Ok(view));
    }

    [HttpPost("{id:guid}/concluir")]
    public async Task<IActionResult> Concluir(
        [FromRoute] Guid id,
        [FromServices] ConcluirTarefaUseCase useCase,
        CancellationToken ct)
    {
        Result<TarefaViewModel> result = await useCase.ExecuteAsync(id, ct);
        return result.ToActionResult(view => Ok(view));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Remover(
        [FromRoute] Guid id,
        [FromServices] RemoverTarefaUseCase useCase,
        CancellationToken ct)
    {
        Result result = await useCase.ExecuteAsync(id, ct);
        return result.ToActionResult(() => NoContent());
    }
}
