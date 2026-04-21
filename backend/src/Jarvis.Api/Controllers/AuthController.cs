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
        [FromBody] CadastrarUsuarioRequest request,
        [FromServices] CadastrarUsuarioUseCase useCase,
        CancellationToken ct)
    {
        var input = new CadastrarUsuarioInput(request.Nome, request.Email, request.Senha);
        var resultado = await useCase.ExecutarAsync(input, ct);
        return Created(string.Empty, resultado);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AutenticacaoViewModel>> Login(
        [FromBody] LoginRequest request,
        [FromServices] LoginUseCase useCase,
        CancellationToken ct)
    {
        var input = new LoginInput(request.Email, request.Senha);
        var resultado = await useCase.ExecutarAsync(input, ct);
        return Ok(resultado);
    }

    public record CadastrarUsuarioRequest(string Nome, string Email, string Senha);
    public record LoginRequest(string Email, string Senha);
}
