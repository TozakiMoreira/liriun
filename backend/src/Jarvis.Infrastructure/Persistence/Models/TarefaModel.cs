using Jarvis.Core.Enums;

namespace Jarvis.Infrastructure.Persistence.Models;

public class TarefaModel
{
    public Guid Id { get; set; }
    public Guid UsuarioId { get; set; }
    public string Nome { get; set; } = null!;
    public Guid? PrazoId { get; set; }
    public DateTime? DataPrazo { get; set; }
    public TimeSpan HorarioFinal { get; set; }
    public Prioridade Prioridade { get; set; }
    public StatusTarefa Status { get; set; }
    public DateTime CriadaEm { get; set; }
    public DateTime? ConcluidaEm { get; set; }

    public ICollection<TarefaCategoriaModel> Categorias { get; set; } = new List<TarefaCategoriaModel>();
}
