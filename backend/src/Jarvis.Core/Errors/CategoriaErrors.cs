using Jarvis.Core.Common;

namespace Jarvis.Core.Errors;

public static class CategoriaErrors
{
    public static Error UsuarioObrigatorio()
        => Error.Validation("categoria.usuario-obrigatorio", "Categoria precisa estar vinculada a um usuario");

    public static Error NomeObrigatorio()
        => Error.Validation("categoria.nome-obrigatorio", "Nome da categoria e obrigatorio");

    public static Error NomeMuitoLongo()
        => Error.Validation("categoria.nome-muito-longo", "Nome da categoria nao pode passar de 50 caracteres");

    public static Error NomeJaExiste()
        => Error.Conflict("categoria.nome-ja-existe", "Ja existe uma categoria com esse nome");

    public static Error NaoEncontrada()
        => Error.NotFound("categoria.nao-encontrada", "Categoria nao encontrada");

    public static Error PossuiTarefasPendentes()
        => Error.Conflict("categoria.possui-tarefas-pendentes", "Categoria possui tarefas pendentes vinculadas. Conclua ou remova as tarefas antes de excluir a categoria.");
}
