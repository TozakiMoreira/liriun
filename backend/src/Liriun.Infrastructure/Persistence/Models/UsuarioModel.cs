namespace Liriun.Infrastructure.Persistence.Models;

public class UsuarioModel
{
    public Guid Id { get; set; }
    public string Nome { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string SenhaHash { get; set; } = null!;
    public string? FotoUrl { get; set; }
    public DateTime CriadoEm { get; set; }
}
