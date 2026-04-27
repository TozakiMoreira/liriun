namespace Jarvis.Core.Entities;

/// <summary>
/// Tabela de junção N:N entre Tarefa e Categoria.
/// </summary>
public class TarefaCategoria
{
    public Guid TarefaId { get; private set; }
    public Tarefa Tarefa { get; private set; } = null!;

    public Guid CategoriaId { get; private set; }
    public Categoria Categoria { get; private set; } = null!;

    private TarefaCategoria() { }

    internal static TarefaCategoria Reconstituir(Guid tarefaId, Guid categoriaId, Categoria? categoria = null)
        => new() { TarefaId = tarefaId, CategoriaId = categoriaId, Categoria = categoria! };

    public TarefaCategoria(Guid tarefaId, Guid categoriaId)
    {
        TarefaId = tarefaId;
        CategoriaId = categoriaId;
    }
}
