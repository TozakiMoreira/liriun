using Jarvis.Application.Interfaces.Auth;
using Jarvis.Core.Entities;
using Jarvis.Core.Exceptions;
using Jarvis.Core.Interfaces.Repositories;

namespace Jarvis.Application.UseCases.Prazos;

public class RemoverPrazoUseCase
{
    private readonly IPrazoRepository _prazos;
    private readonly IUsuarioLogado _usuarioLogado;

    public RemoverPrazoUseCase(IPrazoRepository prazos, IUsuarioLogado usuarioLogado)
    {
        _prazos = prazos;
        _usuarioLogado = usuarioLogado;
    }

    public async Task Executar(Guid id, CancellationToken ct = default)
    {
        Prazo prazo = await _prazos.ObterPorId(id, _usuarioLogado.Id, ct)
            ?? throw new ApplicationLayerException("Prazo não encontrado", 404);

        if (await _prazos.TemTarefaPendente(prazo.Id, ct))
            throw new ApplicationLayerException("Prazo possui tarefas pendentes vinculadas. Conclua ou remova as tarefas antes de excluir o prazo.", 409);

        await _prazos.Remover(prazo, ct);
    }
}
