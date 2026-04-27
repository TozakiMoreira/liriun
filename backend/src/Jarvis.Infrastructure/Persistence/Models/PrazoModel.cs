namespace Jarvis.Infrastructure.Persistence.Models;

public class PrazoModel
{
    public Guid Id { get; set; }
    public Guid UsuarioId { get; set; }
    public string Nome { get; set; } = null!;
    public int? DuracaoDias { get; set; }
    public DateTime CriadoEm { get; set; }
}
