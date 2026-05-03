using Liriun.Core.Common;
using Liriun.Core.Errors;

namespace Liriun.Core.Entities;

public class Usuario
{
    private const int FotoUrlMaxLength = 700_000;

    public Guid Id { get; private set; }
    public string Nome { get; private set; } = null!;
    public string Email { get; private set; } = null!;
    public string SenhaHash { get; private set; } = null!;
    public string? FotoUrl { get; private set; }
    public DateTime CriadoEm { get; private set; }
    public DateTime? TermosAceitosEm { get; private set; }

    private Usuario() { }

    internal static Usuario Reconstituir(
        Guid id, string nome, string email, string senhaHash, string? fotoUrl, DateTime criadoEm, DateTime? termosAceitosEm)
        => new()
        {
            Id = id,
            Nome = nome,
            Email = email,
            SenhaHash = senhaHash,
            FotoUrl = fotoUrl,
            CriadoEm = criadoEm,
            TermosAceitosEm = termosAceitosEm,
        };

    public static Result<Usuario> Criar(string nome, string email, string senhaHash, DateTime? termosAceitosEm = null)
    {
        DateTime agora = DateTime.UtcNow;
        Usuario usuario = new()
        {
            Id = Guid.NewGuid(),
            Nome = nome?.Trim() ?? string.Empty,
            Email = email?.Trim().ToLowerInvariant() ?? string.Empty,
            SenhaHash = senhaHash,
            FotoUrl = null,
            CriadoEm = agora,
            TermosAceitosEm = termosAceitosEm ?? agora
        };

        Result validacao = usuario.Validar();
        if (validacao.IsFailure)
            return Result<Usuario>.Failure(validacao.Error!);

        return Result<Usuario>.Success(usuario);
    }

    public Result AtualizarNome(string novoNome)
    {
        Nome = novoNome?.Trim() ?? string.Empty;
        return Validar();
    }

    public Result AtualizarPerfil(string novoNome, string novoEmail)
    {
        Nome = novoNome?.Trim() ?? string.Empty;
        Email = novoEmail?.Trim().ToLowerInvariant() ?? string.Empty;
        return Validar();
    }

    public Result AlterarSenha(string novoHash)
    {
        if (string.IsNullOrWhiteSpace(novoHash))
            return Result.Failure(UsuarioErrors.SenhaObrigatoria());

        SenhaHash = novoHash;
        return Result.Success();
    }

    public Result AtualizarFotoPerfil(string? novaFotoUrl)
    {
        if (novaFotoUrl is null)
        {
            FotoUrl = null;
            return Result.Success();
        }

        string trimmed = novaFotoUrl.Trim();
        if (trimmed.Length == 0)
        {
            FotoUrl = null;
            return Result.Success();
        }

        if (!trimmed.StartsWith("data:image/", StringComparison.Ordinal))
            return Result.Failure(UsuarioErrors.FotoFormatoInvalido());

        if (trimmed.Length > FotoUrlMaxLength)
            return Result.Failure(UsuarioErrors.FotoMuitoGrande());

        FotoUrl = trimmed;
        return Result.Success();
    }

    private Result Validar()
    {
        if (string.IsNullOrWhiteSpace(Nome))
            return Result.Failure(UsuarioErrors.NomeObrigatorio());

        if (Nome.Length > 100)
            return Result.Failure(UsuarioErrors.NomeMuitoLongo());

        if (string.IsNullOrWhiteSpace(Email))
            return Result.Failure(UsuarioErrors.EmailObrigatorio());

        if (!Email.Contains('@') || !Email.Contains('.'))
            return Result.Failure(UsuarioErrors.EmailInvalido());

        if (string.IsNullOrWhiteSpace(SenhaHash))
            return Result.Failure(UsuarioErrors.SenhaObrigatoria());

        return Result.Success();
    }
}
