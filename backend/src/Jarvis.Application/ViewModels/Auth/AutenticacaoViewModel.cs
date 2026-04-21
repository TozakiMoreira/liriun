namespace Jarvis.Application.ViewModels.Auth;

public class AutenticacaoViewModel
{
    public Guid UsuarioId { get; init; }
    public string Nome { get; init; } = null!;
    public string Email { get; init; } = null!;
    public string Token { get; init; } = null!;
    public DateTime ExpiraEm { get; init; }
}
