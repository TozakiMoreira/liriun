namespace Liriun.Application.InputModels.Auth;

public sealed record LoginInput(
    string Email,
    string Senha);
