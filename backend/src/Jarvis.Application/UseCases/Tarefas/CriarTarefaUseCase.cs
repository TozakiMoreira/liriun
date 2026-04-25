using Jarvis.Application.InputModels.Tarefas;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ViewModels.Tarefas;
using Jarvis.Core.Entities;
using Jarvis.Core.Exceptions;
using Jarvis.Core.Interfaces.Repositories;

namespace Jarvis.Application.UseCases.Tarefas;

public class CriarTarefaUseCase
{
    private readonly ITarefaRepository _tarefas;
    private readonly IPrazoRepository _prazos;
    private readonly ICategoriaRepository _categorias;
    private readonly IUsuarioLogado _usuarioLogado;

    public CriarTarefaUseCase(
        ITarefaRepository tarefas,
        IPrazoRepository prazos,
        ICategoriaRepository categorias,
        IUsuarioLogado usuarioLogado)
    {
        _tarefas = tarefas;
        _prazos = prazos;
        _categorias = categorias;
        _usuarioLogado = usuarioLogado;
    }

    public async Task<TarefaViewModel> Executar(CriarTarefaInput input, CancellationToken ct = default)
    {
        if (input.CategoriaIds.Count > 0 &&
            !await _categorias.TodasPertencemAoUsuario(input.CategoriaIds, _usuarioLogado.Id, ct))
        {
            throw new ApplicationLayerException("Uma ou mais categorias informadas não existem", 400);
        }

        DateTime? dataPrazo = input.DataPrazoCustom;

        if (input.PrazoId.HasValue)
        {
            Prazo prazo = await _prazos.ObterPorId(input.PrazoId.Value, _usuarioLogado.Id, ct)
                ?? throw new ApplicationLayerException("Prazo não encontrado", 400);

            dataPrazo = prazo.ResolverDataPrazo(DateTime.UtcNow);
        }

        Tarefa tarefa = new(
            _usuarioLogado.Id,
            input.Nome,
            input.Prioridade,
            input.PrazoId,
            dataPrazo,
            input.HorarioFinal);

        await _tarefas.Adicionar(tarefa, input.CategoriaIds, ct);

        Tarefa? completa = await _tarefas.ObterPorId(tarefa.Id, _usuarioLogado.Id, ct);
        return TarefaViewModel.From(completa ?? tarefa, DateTime.UtcNow);
    }
}
