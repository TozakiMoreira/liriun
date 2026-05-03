using Liriun.Core.Entities;

namespace Liriun.Application.Interfaces.Auth;

public interface IJwtTokenService
{
    (string token, DateTime expiraEm) Gerar(Usuario usuario);
}
