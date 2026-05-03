using Liriun.Core.Enums;

namespace Liriun.Infrastructure.Persistence.Models;

public class TarefaModel
{
    public Guid Id { get; set; }
    public Guid UsuarioId { get; set; }
    public string Nome { get; set; } = null!;
    public DateTime DataPrazo { get; set; }
    public TimeSpan? HorarioFinal { get; set; }
    public string? Observacoes { get; set; }
    public Prioridade Prioridade { get; set; }
    public StatusTarefa Status { get; set; }
    public DateTime CriadaEm { get; set; }
    public DateTime? ConcluidaEm { get; set; }

    public ICollection<TarefaCategoriaModel> Categorias { get; set; } = new List<TarefaCategoriaModel>();
}
