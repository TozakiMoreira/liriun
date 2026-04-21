using Jarvis.Core.Exceptions;

namespace Jarvis.Core.Entities;

public class Categoria
{
    public Guid Id { get; private set; }
    public Guid UsuarioId { get; private set; }
    public string Nome { get; private set; } = null!;
    public DateTime CriadaEm { get; private set; }

    public ICollection<TarefaCategoria> Tarefas { get; private set; } = new List<TarefaCategoria>();

    private Categoria() { }

    public Categoria(Guid usuarioId, string nome)
    {
        Id = Guid.NewGuid();
        UsuarioId = usuarioId;
        Nome = nome?.Trim() ?? string.Empty;
        CriadaEm = DateTime.UtcNow;
        Validar();
    }

    private void Validar()
    {
        if (UsuarioId == Guid.Empty)
            throw new CategoriaException("Categoria precisa estar vinculada a um usuário");

        if (string.IsNullOrWhiteSpace(Nome))
            throw new CategoriaException("Nome da categoria é obrigatório");

        if (Nome.Length > 50)
            throw new CategoriaException("Nome da categoria não pode passar de 50 caracteres");
    }

    public void Renomear(string novoNome)
    {
        Nome = novoNome?.Trim() ?? string.Empty;
        Validar();
    }
}
