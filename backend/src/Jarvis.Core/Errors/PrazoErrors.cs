using Jarvis.Core.Common;

namespace Jarvis.Core.Errors;

public static class PrazoErrors
{
    public static Error UsuarioObrigatorio()
        => Error.Validation("prazo.usuario-obrigatorio", "Prazo precisa estar vinculado a um usuario");

    public static Error NomeObrigatorio()
        => Error.Validation("prazo.nome-obrigatorio", "Nome do prazo e obrigatorio");

    public static Error NomeMuitoLongo()
        => Error.Validation("prazo.nome-muito-longo", "Nome do prazo nao pode passar de 50 caracteres");

    public static Error DuracaoNegativa()
        => Error.Validation("prazo.duracao-negativa", "Duracao em dias nao pode ser negativa");

    public static Error NomeJaExiste()
        => Error.Conflict("prazo.nome-ja-existe", "Ja existe um prazo com esse nome");

    public static Error NaoEncontrado()
        => Error.NotFound("prazo.nao-encontrado", "Prazo nao encontrado");

    public static Error PossuiTarefasPendentes()
        => Error.Conflict("prazo.possui-tarefas-pendentes", "Prazo possui tarefas pendentes vinculadas. Conclua ou remova as tarefas antes de excluir o prazo.");
}
