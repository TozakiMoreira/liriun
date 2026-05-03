namespace Liriun.Application.Interfaces.Auth;

public interface IUsuarioLogado
{
    Guid Id { get; }
    string Email { get; }
    bool EstaAutenticado { get; }
}
