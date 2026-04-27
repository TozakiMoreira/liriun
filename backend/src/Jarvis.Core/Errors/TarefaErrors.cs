using Jarvis.Core.Common;

namespace Jarvis.Core.Errors;

public static class TarefaErrors
{
    public static Error UsuarioObrigatorio()
        => Error.Validation("tarefa.usuario-obrigatorio", "Tarefa precisa estar vinculada a um usuario");

    public static Error NomeObrigatorio()
        => Error.Validation("tarefa.nome-obrigatorio", "Nome da tarefa e obrigatorio");

    public static Error NomeMuitoLongo()
        => Error.Validation("tarefa.nome-muito-longo", "Nome da tarefa nao pode passar de 200 caracteres");

    public static Error HorarioFinalInvalido()
        => Error.Validation("tarefa.horario-final-invalido", "Horario final deve estar entre 00:00 e 23:59");

    public static Error JaConcluida()
        => Error.Conflict("tarefa.ja-concluida", "Tarefa ja esta concluida");

    public static Error NaoEditavelConcluida()
        => Error.Conflict("tarefa.nao-editavel-concluida", "Nao e possivel editar tarefa concluida");

    public static Error NaoEncontrada()
        => Error.NotFound("tarefa.nao-encontrada", "Tarefa nao encontrada");

    public static Error CategoriasInvalidas()
        => Error.Validation("tarefa.categorias-invalidas", "Uma ou mais categorias informadas nao existem");

    public static Error PrazoNaoEncontrado()
        => Error.NotFound("tarefa.prazo-nao-encontrado", "Prazo nao encontrado");

    public static Error PrazoEDataCustomConflito()
        => Error.Validation("tarefa.prazo-data-custom-conflito", "Use prazo cadastrado ou data custom, nao os dois");
}
