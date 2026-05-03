using Liriun.Core.Entities;

namespace Liriun.Core.Interfaces.Repositories;

public interface IUsuarioRepository
{
    Task<Usuario?> ObterPorIdAsync(Guid id, CancellationToken ct);
    Task<Usuario?> ObterPorEmailAsync(string email, CancellationToken ct);
    Task<Usuario> AdicionarAsync(Usuario usuario, CancellationToken ct);
    Task<Usuario> AtualizarAsync(Usuario usuario, CancellationToken ct);
    Task RemoverAsync(Guid usuarioId, CancellationToken ct);
}
