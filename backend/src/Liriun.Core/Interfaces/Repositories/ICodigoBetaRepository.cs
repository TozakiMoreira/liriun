using Liriun.Core.Common;
using Liriun.Core.Entities;

namespace Liriun.Core.Interfaces.Repositories;

public interface ICodigoBetaRepository
{
    Task<CodigoBeta> AdicionarAsync(CodigoBeta codigo, CancellationToken ct);

    /// <summary>
    /// Consome o codigo de forma ATOMICA: um unico UPDATE que so afeta a linha se ela
    /// estiver disponivel (nao revogada, nao usada, nao expirada). Sucesso apenas quando
    /// exatamente uma linha foi marcada como usada — impede uso duplo em corrida.
    /// </summary>
    Task<Result> ConsumirAtomicoAsync(string codigo, Guid usuarioId, DateTime agora, CancellationToken ct);

    /// <summary>Revoga o codigo (marca revogado_em). Retorna false se nao encontrado.</summary>
    Task<bool> RevogarAsync(Guid id, DateTime agora, CancellationToken ct);
}
