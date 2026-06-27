using System.Security.Cryptography;
using Liriun.Core.Common;
using Liriun.Core.Errors;

namespace Liriun.Core.Entities;

/// <summary>
/// Codigo de convite do beta fechado. Sem um codigo valido nao se cria conta.
/// O consumo (marcar como usado) e feito de forma atomica no banco (ver
/// ICodigoBetaRepository.ConsumirAtomicoAsync) para evitar uso duplo em corrida.
/// </summary>
public class CodigoBeta
{
    // Alfabeto sem caracteres ambiguos (sem 0/O/1/I/L) para facilitar ditar/digitar.
    private const string Alfabeto = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    private const int Comprimento = 8;
    public const string Prefixo = "LRN-";

    public Guid Id { get; private set; }
    public string Codigo { get; private set; } = null!;
    public Guid CriadoPorUsuarioId { get; private set; }
    public DateTime CriadoEm { get; private set; }
    public Guid? UsadoPorUsuarioId { get; private set; }
    public DateTime? UsadoEm { get; private set; }
    public DateTime? RevogadoEm { get; private set; }
    public DateTime? ExpiraEm { get; private set; }

    /// <summary>True se o codigo ainda pode ser usado (nao revogado, nao usado, nao expirado).</summary>
    public bool EstaDisponivel =>
        RevogadoEm is null
        && UsadoPorUsuarioId is null
        && (ExpiraEm is null || ExpiraEm > DateTime.UtcNow);

    private CodigoBeta() { }

    internal static CodigoBeta Reconstituir(
        Guid id, string codigo, Guid criadoPorUsuarioId, DateTime criadoEm,
        Guid? usadoPorUsuarioId, DateTime? usadoEm, DateTime? revogadoEm, DateTime? expiraEm)
        => new()
        {
            Id = id,
            Codigo = codigo,
            CriadoPorUsuarioId = criadoPorUsuarioId,
            CriadoEm = criadoEm,
            UsadoPorUsuarioId = usadoPorUsuarioId,
            UsadoEm = usadoEm,
            RevogadoEm = revogadoEm,
            ExpiraEm = expiraEm,
        };

    public static Result<CodigoBeta> Gerar(Guid criadoPorUsuarioId, DateTime? expiraEm = null)
    {
        CodigoBeta codigo = new()
        {
            Id = Guid.NewGuid(),
            Codigo = GerarCodigo(),
            CriadoPorUsuarioId = criadoPorUsuarioId,
            CriadoEm = DateTime.UtcNow,
            ExpiraEm = expiraEm,
        };

        Result validacao = codigo.Validar();
        if (validacao.IsFailure)
            return Result<CodigoBeta>.Failure(validacao.Error!);

        return Result<CodigoBeta>.Success(codigo);
    }

    /// <summary>Marca como revogado. Idempotente (revogar de novo nao falha).</summary>
    public Result Revogar(DateTime agora)
    {
        RevogadoEm ??= agora;
        return Result.Success();
    }

    /// <summary>Normaliza o que o usuario digitou (trim + maiusculas) para comparar com o armazenado.</summary>
    public static string Normalizar(string? codigo)
        => (codigo ?? string.Empty).Trim().ToUpperInvariant();

    private Result Validar()
    {
        if (CriadoPorUsuarioId == Guid.Empty)
            return Result.Failure(CodigoBetaErrors.CriadorObrigatorio());

        if (string.IsNullOrWhiteSpace(Codigo))
            return Result.Failure(CodigoBetaErrors.CodigoObrigatorio());

        return Result.Success();
    }

    private static string GerarCodigo()
    {
        Span<char> buffer = stackalloc char[Comprimento];
        for (int i = 0; i < Comprimento; i++)
            buffer[i] = Alfabeto[RandomNumberGenerator.GetInt32(Alfabeto.Length)];
        return Prefixo + new string(buffer);
    }
}
