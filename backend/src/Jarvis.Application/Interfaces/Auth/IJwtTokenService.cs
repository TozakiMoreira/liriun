using Jarvis.Core.Entities;

namespace Jarvis.Application.Interfaces.Auth;

public interface IJwtTokenService
{
    (string token, DateTime expiraEm) Gerar(Usuario usuario);
}
