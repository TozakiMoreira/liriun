using Liriun.Core.Common;

namespace Liriun.Core.Errors;

public static class CodigoBetaErrors
{
    /// <summary>
    /// Mensagem GENERICA unica (anti-enumeracao): nao diferencia inexistente / ja usado /
    /// expirado / revogado, para nao dar pistas a quem tenta adivinhar codigos.
    /// </summary>
    public static Error CodigoInvalido()
        => Error.Validation("codigo-beta.invalido", "Codigo beta invalido, ja utilizado ou expirado");

    public static Error CodigoObrigatorio()
        => Error.Validation("codigo-beta.obrigatorio", "Codigo beta e obrigatorio");

    public static Error CriadorObrigatorio()
        => Error.Validation("codigo-beta.criador-obrigatorio", "Criador do codigo e obrigatorio");

    public static Error NaoEncontrado()
        => Error.NotFound("codigo-beta.nao-encontrado", "Codigo beta nao encontrado");
}
