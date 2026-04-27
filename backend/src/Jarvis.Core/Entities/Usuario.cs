using Jarvis.Core.Common;
using Jarvis.Core.Errors;

namespace Jarvis.Core.Entities;

public class Usuario
{
    public Guid Id { get; private set; }
    public string Nome { get; private set; } = null!;
    public string Email { get; private set; } = null!;
    public string SenhaHash { get; private set; } = null!;
    public DateTime CriadoEm { get; private set; }

    private Usuario() { }

    internal static Usuario Reconstituir(Guid id, string nome, string email, string senhaHash, DateTime criadoEm)
        => new() { Id = id, Nome = nome, Email = email, SenhaHash = senhaHash, CriadoEm = criadoEm };

    public static Result<Usuario> Criar(string nome, string email, string senhaHash)
    {
        Usuario usuario = new()
        {
            Id = Guid.NewGuid(),
            Nome = nome?.Trim() ?? string.Empty,
            Email = email?.Trim().ToLowerInvariant() ?? string.Empty,
            SenhaHash = senhaHash,
            CriadoEm = DateTime.UtcNow
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
