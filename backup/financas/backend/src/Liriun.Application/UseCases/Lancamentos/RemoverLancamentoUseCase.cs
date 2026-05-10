using Liriun.Application.Interfaces.Auth;
using Liriun.Core.Common;
using Liriun.Core.Entities;
using Liriun.Core.Errors;
using Liriun.Core.Interfaces.Repositories;

namespace Liriun.Application.UseCases.Lancamentos;

public class RemoverLancamentoUseCase
{
    private readonly ILancamentoRepository _lancamentos;
    private readonly IUsuarioLogado _usuarioLogado;

    public RemoverLancamentoUseCase(ILancamentoRepository lancamentos, IUsuarioLogado usuarioLogado)
    {
        _lancamentos = lancamentos;
        _usuarioLogado = usuarioLogado;
    }

    public async Task<Result> ExecuteAsync(Guid id, CancellationToken ct)
    {
        Lancamento? lancamento = await _lancamentos.ObterPorIdAsync(id, _usuarioLogado.Id, ct);
        if (lancamento is null)
            return Result.Failure(LancamentoErrors.NaoEncontrado());

        await _lancamentos.RemoverAsync(lancamento, ct);
        return Result.Success();
    }
}
