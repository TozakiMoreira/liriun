using Liriun.Core.Common;

namespace Liriun.Core.Errors;

public static class LancamentoErrors
{
    public static Error UsuarioObrigatorio()
        => Error.Validation("lancamento.usuario-obrigatorio", "Lancamento precisa estar vinculado a um usuario");

    public static Error DescricaoObrigatoria()
        => Error.Validation("lancamento.descricao-obrigatoria", "Descricao e obrigatoria");

    public static Error DescricaoMuitoLonga()
        => Error.Validation("lancamento.descricao-muito-longa", "Descricao nao pode passar de 200 caracteres");

    public static Error ValorInvalido()
        => Error.Validation("lancamento.valor-invalido", "Valor deve ser maior que zero");

    public static Error DataObrigatoria()
        => Error.Validation("lancamento.data-obrigatoria", "Data de referencia e obrigatoria");

    public static Error AnexoMuitoGrande()
        => Error.Validation("lancamento.anexo-muito-grande", "Anexo nao pode passar de 1MB");

    public static Error AnexoFormatoInvalido()
        => Error.Validation("lancamento.anexo-formato-invalido", "Anexo deve ser PDF ou imagem");

    public static Error ObservacoesMuitoLongas()
        => Error.Validation("lancamento.observacoes-muito-longas", "Observacoes nao pode passar de 2000 caracteres");

    public static Error JaPago()
        => Error.Conflict("lancamento.ja-pago", "Lancamento ja esta pago");

    public static Error NaoEncontrado()
        => Error.NotFound("lancamento.nao-encontrado", "Lancamento nao encontrado");

    public static Error CategoriaIncompativel()
        => Error.Validation("lancamento.categoria-incompativel", "Categoria nao corresponde ao tipo do lancamento");
}
