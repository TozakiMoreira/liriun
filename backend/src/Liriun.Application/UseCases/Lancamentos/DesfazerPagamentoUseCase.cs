using Liriun.Application.Interfaces.Auth;
using Liriun.Application.ViewModels.Lancamentos;
using Liriun.Core.Common;
using Liriun.Core.Entities;
using Liriun.Core.Errors;
using Liriun.Core.Interfaces.Repositories;

namespace Liriun.Application.UseCases.Lancamentos;

public class DesfazerPagamentoUseCase
{
    private readonly ILancamentoRepository _lancamentos;
    private readonly IUsuarioLogado _usuarioLogado;

    public DesfazerPagamentoUseCase(ILancamentoRepository lancamentos, IUsuarioLogado usuarioLogado)
    {
        _lancamentos = lancamentos;
        _usuarioLogado = usuarioLogado;
    }

    public async Task<Result<LancamentoViewModel>> ExecuteAsync(Guid id, CancellationToken ct)
    {
        Lancamento? lancamento = await _lancamentos.ObterPorIdAsync(id, _usuarioLogado.Id, ct);
        if (lancamento is null)
            return Result<LancamentoViewModel>.Failure(LancamentoErrors.NaoEncontrado());

        Result resultado = lancamento.MarcarComoPendente();
        if (resultado.IsFailure)
            return Result<LancamentoViewModel>.Failure(resultado.Error!);

        Lancamento salvo = await _lancamentos.AtualizarAsync(lancamento, ct);
        return Result<LancamentoViewModel>.Success(LancamentoViewModel.FromEntity(salvo));
    }
}
