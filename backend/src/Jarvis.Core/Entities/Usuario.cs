using Jarvis.Core.Exceptions;

namespace Jarvis.Core.Entities;

public class Usuario
{
    public Guid Id { get; private set; }
    public string Nome { get; private set; } = null!;
    public string Email { get; private set; } = null!;
    public string SenhaHash { get; private set; } = null!;
    public DateTime CriadoEm { get; private set; }

    private Usuario() { }

    public Usuario(string nome, string email, string senhaHash)
    {
        Id = Guid.NewGuid();
        Nome = nome;
        Email = email?.Trim().ToLowerInvariant() ?? string.Empty;
        SenhaHash = senhaHash;
        CriadoEm = DateTime.UtcNow;
        Validar();
    }

    private void Validar()
    {
        if (string.IsNullOrWhiteSpace(Nome))
            throw new UsuarioException("Nome do usuário é obrigatório");

        if (Nome.Length > 100)
            throw new UsuarioException("Nome não pode passar de 100 caracteres");

        if (string.IsNullOrWhiteSpace(Email))
            throw new UsuarioException("Email é obrigatório");

        if (!Email.Contains('@') || !Email.Contains('.'))
            throw new UsuarioException("Email em formato inválido");

        if (string.IsNullOrWhiteSpace(SenhaHash))
            throw new UsuarioException("Senha é obrigatória");
    }

    public void AtualizarNome(string novoNome)
    {
        Nome = novoNome;
        Validar();
    }
}
