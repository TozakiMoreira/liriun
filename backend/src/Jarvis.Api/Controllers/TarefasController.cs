using Jarvis.Application.InputModels.Tarefas;
using Jarvis.Application.UseCases.Tarefas;
using Jarvis.Application.ViewModels.Tarefas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jarvis.Api.Controllers;

[ApiController]
[Authorize]
[Route("tarefas")]
public class TarefasController : ControllerBase
{
    [HttpGet("pendentes")]
    public async Task<ActionResult<IReadOnlyList<TarefaViewModel>>> ListarPendentes(
        [FromServices] ListarTarefasPendentesUseCase useCase,
        CancellationToken ct)
    {
        IReadOnlyList<TarefaViewModel> lista = await useCase.Executar(ct);
        return Ok(lista);
    }

    [HttpGet("concluidas")]
    public async Task<ActionResult<IReadOnlyList<TarefaViewModel>>> ListarConcluidas(
        [FromServices] ListarTarefasConcluidasUseCase useCase,
        [FromQuery] DateTime? de,
        [FromQuery] DateTime? ate,
        CancellationToken ct)
    {
        IReadOnlyList<TarefaViewModel> lista = await useCase.Executar(de, ate, ct);
        return Ok(lista);
    }

    [HttpPost]
    public async Task<ActionResult<TarefaViewModel>> Criar(
        [FromBody] CriarTarefaInput input,
        [FromServices] CriarTarefaUseCase useCase,
        CancellationToken ct)
    {
        TarefaViewModel tarefa = await useCase.Executar(input, ct);
        return Created($"/tarefas/{tarefa.Id}", tarefa);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TarefaViewModel>> Atualizar(
        [FromRoute] Guid id,
        [FromBody] AtualizarTarefaInput input,
        [FromServices] AtualizarTarefaUseCase useCase,
        CancellationToken ct)
    {
        TarefaViewModel tarefa = await useCase.Executar(id, input, ct);
        return Ok(tarefa);
    }

    [HttpPost("{id:guid}/concluir")]
    public async Task<ActionResult<TarefaViewModel>> Concluir(
        [FromRoute] Guid id,
        [FromServices] ConcluirTarefaUseCase useCase,
        CancellationToken ct)
    {
        TarefaViewModel tarefa = await useCase.Executar(id, ct);
        return Ok(tarefa);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Remover(
        [FromRoute] Guid id,
        [FromServices] RemoverTarefaUseCase useCase,
        CancellationToken ct)
    {
        await useCase.Executar(id, ct);
        return NoContent();
    }
}
