using Liriun.Application.Interfaces.Auth;
using Liriun.Application.ReadRepositories;
using Liriun.Core.Common;
using Liriun.Core.Errors;

namespace Liriun.Application.UseCases.Lancamentos;

public class ObterAnexoUseCase
{
    private readonly ILancamentoReadRepository _read;
    private readonly IUsuarioLogado _usuarioLogado;

    public ObterAnexoUseCase(ILancamentoReadRepository read, IUsuarioLogado usuarioLogado)
    {
        _read = read;
        _usuarioLogado = usuarioLogado;
    }

    public async Task<Result<string>> ExecuteAsync(Guid id, CancellationToken ct)
    {
        string? anexo = await _read.ObterAnexoAsync(id, _usuarioLogado.Id, ct);
        if (anexo is null)
            return Result<string>.Failure(LancamentoErrors.NaoEncontrado());

        return Result<string>.Success(anexo);
    }
}
