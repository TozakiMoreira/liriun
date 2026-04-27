namespace Jarvis.Application.InputModels.Auth;

public sealed record LoginInput(
    string Email,
    string Senha);
