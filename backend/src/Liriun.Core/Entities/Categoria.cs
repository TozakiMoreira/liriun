using Liriun.Core.Common;
using Liriun.Core.Errors;

namespace Liriun.Core.Entities;

public class Categoria
{
    public Guid Id { get; private set; }
    public Guid UsuarioId { get; private set; }
    public string Nome { get; private set; } = null!;
    public DateTime CriadaEm { get; private set; }

    public ICollection<TarefaCategoria> Tarefas { get; private set; } = new List<TarefaCategoria>();

    private Categoria() { }

    internal static Categoria Reconstituir(Guid id, Guid usuarioId, string nome, DateTime criadaEm)
        => new() { Id = id, UsuarioId = usuarioId, Nome = nome, CriadaEm = criadaEm };

    public static Result<Categoria> Criar(Guid usuarioId, string nome)
    {
        Categoria categoria = new()
        {
            Id = Guid.NewGuid(),
            UsuarioId = usuarioId,
            Nome = nome?.Trim() ?? string.Empty,
            CriadaEm = DateTime.UtcNow
        };

        Result validacao = categoria.Validar();
        if (validacao.IsFailure)
            return Result<Categoria>.Failure(validacao.Error!);

        return Result<Categoria>.Success(categoria);
    }

    public Result Renomear(string novoNome)
    {
        Nome = novoNome?.Trim() ?? string.Empty;
        return Validar();
    }

    private Result Validar()
    {
        if (UsuarioId == Guid.Empty)
            return Result.Failure(CategoriaErrors.UsuarioObrigatorio());

        if (string.IsNullOrWhiteSpace(Nome))
            return Result.Failure(CategoriaErrors.NomeObrigatorio());

        if (Nome.Length > 50)
            return Result.Failure(CategoriaErrors.NomeMuitoLongo());

        return Result.Success();
    }
}
