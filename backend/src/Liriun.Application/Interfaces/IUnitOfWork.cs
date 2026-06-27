using Liriun.Core.Common;

namespace Liriun.Application.Interfaces;

public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken ct);

    /// <summary>
    /// Executa a acao dentro de uma transacao: commita se o Result for sucesso, faz
    /// rollback em falha de dominio ou excecao. Use quando varias operacoes precisam
    /// ser atomicas (ex.: consumir o codigo beta + criar o usuario).
    /// </summary>
    Task<Result<T>> ExecuteInTransactionAsync<T>(Func<CancellationToken, Task<Result<T>>> acao, CancellationToken ct);
}
