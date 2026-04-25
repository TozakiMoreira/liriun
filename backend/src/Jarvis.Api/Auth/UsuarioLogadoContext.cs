using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Jarvis.Application.Interfaces.Auth;

namespace Jarvis.Api.Auth;

public class UsuarioLogadoContext : IUsuarioLogado
{
    private readonly IHttpContextAccessor _http;

    public UsuarioLogadoContext(IHttpContextAccessor http)
    {
        _http = http;
    }

    public bool EstaAutenticado =>
        _http.HttpContext?.User?.Identity?.IsAuthenticated ?? false;

    public Guid Id
    {
        get
        {
            string? sub = _http.HttpContext?.User?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                       ?? _http.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            return Guid.TryParse(sub, out Guid id) ? id : Guid.Empty;
        }
    }

    public string Email =>
        _http.HttpContext?.User?.FindFirst(JwtRegisteredClaimNames.Email)?.Value
        ?? _http.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value
        ?? string.Empty;
}
