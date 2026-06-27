namespace Liriun.Application.InputModels.Auth;

public sealed record CadastrarUsuarioInput(
    string Nome,
    string Email,
    string Senha,
    bool AceitouTermos,
    string CodigoBeta,
    string? TimeZoneId = null);
