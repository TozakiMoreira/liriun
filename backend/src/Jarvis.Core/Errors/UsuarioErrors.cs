using Jarvis.Core.Common;

namespace Jarvis.Core.Errors;

public static class UsuarioErrors
{
    public static Error NomeObrigatorio()
        => Error.Validation("usuario.nome-obrigatorio", "Nome do usuario e obrigatorio");

    public static Error NomeMuitoLongo()
        => Error.Validation("usuario.nome-muito-longo", "Nome nao pode passar de 100 caracteres");

    public static Error EmailObrigatorio()
        => Error.Validation("usuario.email-obrigatorio", "Email e obrigatorio");

    public static Error EmailInvalido()
        => Error.Validation("usuario.email-invalido", "Email em formato invalido");

    public static Error SenhaObrigatoria()
        => Error.Validation("usuario.senha-obrigatoria", "Senha e obrigatoria");

    public static Error EmailJaCadastrado()
        => Error.Conflict("usuario.email-ja-cadastrado", "Ja existe um usuario com esse email");

    public static Error CredenciaisInvalidas()
        => Error.Unauthorized("usuario.credenciais-invalidas", "Email ou senha invalidos");
}
