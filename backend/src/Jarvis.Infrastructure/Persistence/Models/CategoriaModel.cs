namespace Jarvis.Infrastructure.Persistence.Models;

public class CategoriaModel
{
    public Guid Id { get; set; }
    public Guid UsuarioId { get; set; }
    public string Nome { get; set; } = null!;
    public DateTime CriadaEm { get; set; }

    public ICollection<TarefaCategoriaModel> Tarefas { get; set; } = new List<TarefaCategoriaModel>();
}
