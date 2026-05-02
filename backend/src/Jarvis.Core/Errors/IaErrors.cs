using Jarvis.Core.Common;

namespace Jarvis.Core.Errors;

public static class IaErrors
{
    public static Error TextoObrigatorio()
        => Error.Validation("ia.texto-obrigatorio", "Texto pra analise e obrigatorio");

    public static Error TextoMuitoLongo()
        => Error.Validation("ia.texto-muito-longo", "Texto pra analise nao pode passar de 2000 caracteres");

    public static Error FalhaNaAnalise()
        => Error.Failure("ia.falha-na-analise", "Nao consegui processar essa entrada agora");

    public static Error RespostaInvalida()
        => Error.Failure("ia.resposta-invalida", "A IA devolveu uma resposta que eu nao entendi");

    public static Error NaoConfigurada()
        => Error.Failure("ia.nao-configurada", "Servico de IA nao esta configurado");

    public static Error Timeout()
        => Error.Failure("ia.timeout", "Demorei demais pra pensar. Tenta de novo em alguns segundos.");
}
