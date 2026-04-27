namespace Jarvis.Application.InputModels.Auth;

public sealed record CadastrarUsuarioInput(
    string Nome,
    string Email,
    string Senha);
