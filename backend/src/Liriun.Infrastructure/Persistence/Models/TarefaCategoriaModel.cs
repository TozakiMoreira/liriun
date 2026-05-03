namespace Liriun.Infrastructure.Persistence.Models;

public class TarefaCategoriaModel
{
    public Guid TarefaId { get; set; }
    public TarefaModel Tarefa { get; set; } = null!;

    public Guid CategoriaId { get; set; }
    public CategoriaModel Categoria { get; set; } = null!;
}
