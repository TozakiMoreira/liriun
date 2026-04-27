using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ReadRepositories;
using Jarvis.Core.Common;
using Jarvis.Core.Entities;
using Jarvis.Core.Errors;
using Jarvis.Core.Interfaces.Repositories;

namespace Jarvis.Application.UseCases.Prazos;

public class RemoverPrazoUseCase
{
    private readonly IPrazoRepository _prazos;
    private readonly IPrazoReadRepository _prazoRead;
    private readonly IUsuarioLogado _usuarioLogado;

    public RemoverPrazoUseCase(
        IPrazoRepository prazos,
        IPrazoReadRepository prazoRead,
        IUsuarioLogado usuarioLogado)
    {
        _prazos = prazos;
        _prazoRead = prazoRead;
        _usuarioLogado = usuarioLogado;
    }

    public async Task<Result> ExecuteAsync(Guid id, CancellationToken ct)
    {
        Prazo? prazo = await _prazos.ObterPorIdAsync(id, _usuarioLogado.Id, ct);
        if (prazo is null)
            return Result.Failure(PrazoErrors.NaoEncontrado());

        if (await _prazoRead.TemTarefaPendenteAsync(prazo.Id, ct))
            return Result.Failure(PrazoErrors.PossuiTarefasPendentes());

        await _prazos.RemoverAsync(prazo, ct);
        return Result.Success();
    }
}
