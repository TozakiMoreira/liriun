using Liriun.Application.Interfaces.Auth;
using Liriun.Application.ReadModels;
using Liriun.Application.ReadRepositories;
using Liriun.Application.ViewModels.Lancamentos;
using Liriun.Core.Common;

namespace Liriun.Application.UseCases.Lancamentos;

public class ObterBalancoUseCase
{
    private readonly ILancamentoReadRepository _read;
    private readonly IUsuarioLogado _usuarioLogado;

    public ObterBalancoUseCase(ILancamentoReadRepository read, IUsuarioLogado usuarioLogado)
    {
        _read = read;
        _usuarioLogado = usuarioLogado;
    }

    public async Task<Result<BalancoViewModel>> ExecuteAsync(int ano, int? mes, CancellationToken ct)
    {
        BalancoReadModel balanco = await _read.ObterBalancoAsync(_usuarioLogado.Id, ano, mes, ct);
        return Result<BalancoViewModel>.Success(BalancoViewModel.FromReadModel(balanco));
    }
}
