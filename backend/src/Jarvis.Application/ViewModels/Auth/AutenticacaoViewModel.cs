namespace Jarvis.Application.ViewModels.Auth;

public sealed record AutenticacaoViewModel(
    Guid UsuarioId,
    string Nome,
    string Email,
    string Token,
    DateTime ExpiraEm);
