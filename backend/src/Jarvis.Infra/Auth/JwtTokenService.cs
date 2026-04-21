using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Core.Entities;
using Microsoft.IdentityModel.Tokens;

namespace Jarvis.Infra.Auth;

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

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, usuario.Email),
            new Claim("nome", usuario.Nome),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

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
