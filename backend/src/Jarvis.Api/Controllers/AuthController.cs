using Jarvis.Application.InputModels.Auth;
using Jarvis.Application.UseCases.Auth;
using Jarvis.Application.ViewModels.Auth;
using Microsoft.AspNetCore.Mvc;

namespace Jarvis.Api.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    [HttpPost("cadastro")]
    public async Task<ActionResult<AutenticacaoViewModel>> Cadastrar(
        [FromBody] CadastrarUsuarioInput input,
        [FromServices] CadastrarUsuarioUseCase useCase,
        CancellationToken ct)
    {
        AutenticacaoViewModel resultado = await useCase.Executar(input, ct);
        return Created(string.Empty, resultado);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AutenticacaoViewModel>> Login(
        [FromBody] LoginInput input,
        [FromServices] LoginUseCase useCase,
        CancellationToken ct)
    {
        AutenticacaoViewModel resultado = await useCase.Executar(input, ct);
        return Ok(resultado);
    }
}
