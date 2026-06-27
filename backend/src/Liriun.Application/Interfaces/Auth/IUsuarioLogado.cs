namespace Liriun.Application.Interfaces.Auth;

public interface IUsuarioLogado
{
    Guid Id { get; }
    string Email { get; }
    string TimeZoneId { get; }
    bool EstaAutenticado { get; }
    bool EhAdmin { get; }
}
