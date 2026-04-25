using Jarvis.Application.InputModels.Prazos;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ViewModels.Prazos;
using Jarvis.Core.Entities;
using Jarvis.Core.Exceptions;
using Jarvis.Core.Interfaces.Repositories;

namespace Jarvis.Application.UseCases.Prazos;

public class CriarPrazoUseCase
{
    private readonly IPrazoRepository _prazos;
    private readonly IUsuarioLogado _usuarioLogado;

    public CriarPrazoUseCase(IPrazoRepository prazos, IUsuarioLogado usuarioLogado)
    {
        _prazos = prazos;
        _usuarioLogado = usuarioLogado;
    }

    public async Task<PrazoViewModel> Executar(CriarPrazoInput input, CancellationToken ct = default)
    {
        if (await _prazos.ExisteNome(_usuarioLogado.Id, input.Nome, ct))
            throw new ApplicationLayerException("Já existe um prazo com esse nome", 409);

        Prazo prazo = new(_usuarioLogado.Id, input.Nome, input.DuracaoDias);
        await _prazos.Adicionar(prazo, ct);

        return PrazoViewModel.From(prazo);
    }
}
