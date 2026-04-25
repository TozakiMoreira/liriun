using Jarvis.Core.Entities;

namespace Jarvis.Core.Interfaces.Repositories;

public interface IUsuarioRepository
{
    Task<Usuario?> ObterPorId(Guid id, CancellationToken ct = default);
    Task<Usuario?> ObterPorEmail(string email, CancellationToken ct = default);
    Task<bool> ExisteEmail(string email, CancellationToken ct = default);
    Task Adicionar(Usuario usuario, CancellationToken ct = default);
    Task Atualizar(Usuario usuario, CancellationToken ct = default);
}
