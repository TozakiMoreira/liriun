using Liriun.Application.InputModels.Admin;
using Liriun.Application.Interfaces.Auth;
using Liriun.Application.ViewModels.Admin;
using Liriun.Core.Common;
using Liriun.Core.Entities;
using Liriun.Core.Interfaces.Repositories;

namespace Liriun.Application.UseCases.Admin;

public class GerarCodigoBetaUseCase
{
    private const int QuantidadeMaxima = 50;

    private readonly ICodigoBetaRepository _codigos;
    private readonly IUsuarioLogado _usuarioLogado;

    public GerarCodigoBetaUseCase(ICodigoBetaRepository codigos, IUsuarioLogado usuarioLogado)
    {
        _codigos = codigos;
        _usuarioLogado = usuarioLogado;
    }

    public async Task<Result<IReadOnlyList<CodigoBetaViewModel>>> ExecuteAsync(GerarCodigoBetaInput input, CancellationToken ct)
    {
        int quantidade = Math.Clamp(input.Quantidade ?? 1, 1, QuantidadeMaxima);
        List<CodigoBetaViewModel> gerados = new(quantidade);

        for (int i = 0; i < quantidade; i++)
        {
            Result<CodigoBeta> criacao = CodigoBeta.Gerar(_usuarioLogado.Id, input.ExpiraEm);
            if (criacao.IsFailure)
                return Result<IReadOnlyList<CodigoBetaViewModel>>.Failure(criacao.Error!);

            CodigoBeta codigo = await _codigos.AdicionarAsync(criacao.Value!, ct);
            gerados.Add(CodigoBetaViewModel.FromEntity(codigo));
        }

        return Result<IReadOnlyList<CodigoBetaViewModel>>.Success(gerados);
    }
}
