using Liriun.Core.Common;

namespace Liriun.Core.Errors;

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

    public static Error DataPrazoObrigatoria()
        => Error.Validation("tarefa.data-prazo-obrigatoria", "Data do prazo e obrigatoria");

    public static Error DataPrazoNoPassado()
        => Error.Validation("tarefa.data-prazo-no-passado", "Data do prazo nao pode ser anterior a hoje");

    public static Error ObservacoesMuitoLongas()
        => Error.Validation("tarefa.observacoes-muito-longas", "Observacoes nao pode passar de 4000 caracteres");

    public static Error NaoConcluidaParaReabrir()
        => Error.Conflict("tarefa.nao-concluida-para-reabrir", "So da pra reabrir tarefa que esta concluida");
}
