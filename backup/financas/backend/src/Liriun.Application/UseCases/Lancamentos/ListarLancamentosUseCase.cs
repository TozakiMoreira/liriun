using Liriun.Application.Interfaces.Auth;
using Liriun.Application.ReadModels;
using Liriun.Application.ReadRepositories;
using Liriun.Application.ViewModels.Lancamentos;
using Liriun.Core.Common;

namespace Liriun.Application.UseCases.Lancamentos;

public class ListarLancamentosUseCase
{
    private readonly ILancamentoReadRepository _read;
    private readonly IUsuarioLogado _usuarioLogado;

    public ListarLancamentosUseCase(ILancamentoReadRepository read, IUsuarioLogado usuarioLogado)
    {
        _read = read;
        _usuarioLogado = usuarioLogado;
    }

    public async Task<Result<IReadOnlyList<LancamentoViewModel>>> ExecuteAsync(int? ano, int? mes, CancellationToken ct)
    {
        IReadOnlyList<LancamentoReadModel> lista = await _read.ListarAsync(_usuarioLogado.Id, ano, mes, ct);
        IReadOnlyList<LancamentoViewModel> view = lista.Select(LancamentoViewModel.FromReadModel).ToList();
        return Result<IReadOnlyList<LancamentoViewModel>>.Success(view);
    }
}
