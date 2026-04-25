using Jarvis.Application.InputModels.Prazos;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ViewModels.Prazos;
using Jarvis.Core.Entities;
using Jarvis.Core.Exceptions;
using Jarvis.Core.Interfaces.Repositories;

namespace Jarvis.Application.UseCases.Prazos;

public class AtualizarPrazoUseCase
{
    private readonly IPrazoRepository _prazos;
    private readonly IUsuarioLogado _usuarioLogado;

    public AtualizarPrazoUseCase(IPrazoRepository prazos, IUsuarioLogado usuarioLogado)
    {
        _prazos = prazos;
        _usuarioLogado = usuarioLogado;
    }

    public async Task<PrazoViewModel> Executar(Guid id, AtualizarPrazoInput input, CancellationToken ct = default)
    {
        Prazo prazo = await _prazos.ObterPorId(id, _usuarioLogado.Id, ct)
            ?? throw new ApplicationLayerException("Prazo não encontrado", 404);

        if (await _prazos.ExisteOutraComNome(_usuarioLogado.Id, input.Nome, id, ct))
            throw new ApplicationLayerException("Já existe um prazo com esse nome", 409);

        prazo.Atualizar(input.Nome, input.DuracaoDias);
        await _prazos.Atualizar(prazo, ct);

        return PrazoViewModel.From(prazo);
    }
}
