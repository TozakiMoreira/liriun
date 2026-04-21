using Jarvis.Core.Exceptions;

namespace Jarvis.Application.InputModels.Auth;

public class CadastrarUsuarioInput
{
    public string Nome { get; }
    public string Email { get; }
    public string Senha { get; }

    public CadastrarUsuarioInput(string nome, string email, string senha)
    {
        Nome = nome?.Trim() ?? string.Empty;
        Email = email?.Trim().ToLowerInvariant() ?? string.Empty;
        Senha = senha ?? string.Empty;
        Validar();
    }

    private void Validar()
    {
        if (string.IsNullOrWhiteSpace(Nome))
            throw new ApplicationLayerException("Nome é obrigatório");

        if (Nome.Length > 100)
            throw new ApplicationLayerException("Nome não pode passar de 100 caracteres");

        if (string.IsNullOrWhiteSpace(Email))
            throw new ApplicationLayerException("Email é obrigatório");

        if (!Email.Contains('@') || !Email.Contains('.'))
            throw new ApplicationLayerException("Email em formato inválido");

        if (Email.Length > 150)
            throw new ApplicationLayerException("Email não pode passar de 150 caracteres");

        if (string.IsNullOrWhiteSpace(Senha))
            throw new ApplicationLayerException("Senha é obrigatória");

        if (Senha.Length < 8)
            throw new ApplicationLayerException("Senha precisa ter ao menos 8 caracteres");

        if (Senha.Length > 100)
            throw new ApplicationLayerException("Senha não pode passar de 100 caracteres");
    }
}
