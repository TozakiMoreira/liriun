using Jarvis.Core.Entities;

namespace Jarvis.Core.Interfaces.Repositories;

public interface IUsuarioRepository
{
    Task<Usuario?> ObterPorIdAsync(Guid id, CancellationToken ct);
    Task<Usuario?> ObterPorEmailAsync(string email, CancellationToken ct);
    Task<Usuario> AdicionarAsync(Usuario usuario, CancellationToken ct);
    Task<Usuario> AtualizarAsync(Usuario usuario, CancellationToken ct);
}
