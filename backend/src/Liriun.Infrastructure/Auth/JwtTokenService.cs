using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Liriun.Application.Interfaces.Auth;
using Liriun.Core.Entities;
using Microsoft.IdentityModel.Tokens;

namespace Liriun.Infrastructure.Auth;

public class JwtTokenService : IJwtTokenService
{
    private readonly JwtOptions _options;

    public JwtTokenService(JwtOptions options)
    {
        _options = options;
    }

    public (string token, DateTime expiraEm) Gerar(Usuario usuario)
    {
        var chave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Secret));
        var credenciais = new SigningCredentials(chave, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, usuario.Email),
            new("nome", usuario.Nome),
            new("tz", usuario.TimeZoneId),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        // Papel admin (usa ClaimTypes.Role = RoleClaimType default do JwtBearer, entao
        // [Authorize(Roles="Admin")]/RequireRole funcionam sem config extra).
        if (usuario.EhAdmin)
            claims.Add(new Claim(ClaimTypes.Role, "Admin"));

        var expira = DateTime.UtcNow.AddHours(_options.ExpirationHours);

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            expires: expira,
            signingCredentials: credenciais);

        return (new JwtSecurityTokenHandler().WriteToken(token), expira);
    }
}
