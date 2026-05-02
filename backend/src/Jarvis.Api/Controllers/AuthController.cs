using Jarvis.Api.Extensions;
using Jarvis.Application.InputModels.Auth;
using Jarvis.Application.UseCases.Auth;
using Jarvis.Application.ViewModels.Auth;
using Jarvis.Core.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jarvis.Api.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    [HttpPost("cadastro")]
    public async Task<IActionResult> Cadastrar(
        [FromBody] CadastrarUsuarioInput input,
        [FromServices] CadastrarUsuarioUseCase useCase,
        CancellationToken ct)
    {
        Result<AutenticacaoViewModel> result = await useCase.ExecuteAsync(input, ct);
        return result.ToActionResult(view => Created(string.Empty, view));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginInput input,
        [FromServices] LoginUseCase useCase,
        CancellationToken ct)
    {
        Result<AutenticacaoViewModel> result = await useCase.ExecuteAsync(input, ct);
        return result.ToActionResult(view => Ok(view));
    }

    [HttpPost("alterar-senha")]
    [Authorize]
    public async Task<IActionResult> AlterarSenha(
        [FromBody] AlterarSenhaInput input,
        [FromServices] AlterarSenhaUseCase useCase,
        CancellationToken ct)
    {
        Result result = await useCase.ExecuteAsync(input, ct);
        return result.ToActionResult(() => NoContent());
    }

    [HttpPut("perfil")]
    [Authorize]
    public async Task<IActionResult> AtualizarPerfil(
        [FromBody] AtualizarPerfilInput input,
        [FromServices] AtualizarPerfilUseCase useCase,
        CancellationToken ct)
    {
        Result<PerfilViewModel> result = await useCase.ExecuteAsync(input, ct);
        return result.ToActionResult(view => Ok(view));
    }

    [HttpPut("perfil/foto")]
    [Authorize]
    public async Task<IActionResult> AtualizarFotoPerfil(
        [FromBody] AtualizarFotoPerfilInput input,
        [FromServices] AtualizarFotoPerfilUseCase useCase,
        CancellationToken ct)
    {
        Result<PerfilViewModel> result = await useCase.ExecuteAsync(input, ct);
        return result.ToActionResult(view => Ok(view));
    }
}
