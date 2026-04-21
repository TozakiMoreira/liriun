using Jarvis.Core.Exceptions;

namespace Jarvis.Application.InputModels.Auth;

public class LoginInput
{
    public string Email { get; }
    public string Senha { get; }

    public LoginInput(string email, string senha)
    {
        Email = email?.Trim().ToLowerInvariant() ?? string.Empty;
        Senha = senha ?? string.Empty;
        Validar();
    }

    private void Validar()
    {
        if (string.IsNullOrWhiteSpace(Email))
            throw new ApplicationLayerException("Email é obrigatório");

        if (string.IsNullOrWhiteSpace(Senha))
            throw new ApplicationLayerException("Senha é obrigatória");
    }
}
