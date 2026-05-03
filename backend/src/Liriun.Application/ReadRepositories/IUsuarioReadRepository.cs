namespace Liriun.Application.ReadRepositories;

public interface IUsuarioReadRepository
{
    Task<bool> ExisteEmailAsync(string email, CancellationToken ct);
}
