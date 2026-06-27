namespace Liriun.Infrastructure.Persistence.Models;

public class CodigoBetaModel
{
    public Guid Id { get; set; }
    public string Codigo { get; set; } = null!;
    public Guid CriadoPorUsuarioId { get; set; }
    public DateTime CriadoEm { get; set; }
    public Guid? UsadoPorUsuarioId { get; set; }
    public DateTime? UsadoEm { get; set; }
    public DateTime? RevogadoEm { get; set; }
    public DateTime? ExpiraEm { get; set; }
}
