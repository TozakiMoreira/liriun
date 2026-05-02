using FluentAssertions;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.UseCases.Tarefas;
using Jarvis.Application.ViewModels.Tarefas;
using Jarvis.Core.Common;
using Jarvis.Core.Entities;
using Jarvis.Core.Enums;
using Jarvis.Core.Interfaces.Repositories;
using Moq;

namespace Jarvis.Application.Tests.UseCases.Tarefas;

public class ReabrirTarefaUseCaseTests
{
    private readonly Mock<ITarefaRepository> _tarefas = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Guid _usuarioId = Guid.NewGuid();
    private static readonly DateTime DataDefault = new(2026, 5, 10);

    public ReabrirTarefaUseCaseTests()
    {
        _usuarioLogado.SetupGet(u => u.Id).Returns(_usuarioId);
        _tarefas.Setup(t => t.AtualizarAsync(It.IsAny<Tarefa>(), It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tarefa t, IEnumerable<Guid> _, CancellationToken __) => t);
    }

    private ReabrirTarefaUseCase Criar() => new(_tarefas.Object, _usuarioLogado.Object);

    [Fact]
    public async Task Reabre_tarefa_concluida()
    {
        Tarefa tarefa = Tarefa.Criar(_usuarioId, "X", Prioridade.Normal, DataDefault).Value!;
        tarefa.Concluir();
        _tarefas.Setup(t => t.ObterPorIdAsync(tarefa.Id, _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tarefa);

        Result<TarefaViewModel> result = await Criar().ExecuteAsync(tarefa.Id, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Status.Should().NotBe(StatusTarefa.Concluida);
        tarefa.Status.Should().Be(StatusTarefa.Pendente);
        tarefa.ConcluidaEm.Should().BeNull();
    }

    [Fact]
    public async Task Retorna_not_found_quando_nao_existe()
    {
        _tarefas.Setup(t => t.ObterPorIdAsync(It.IsAny<Guid>(), _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tarefa?)null);

        Result<TarefaViewModel> result = await Criar().ExecuteAsync(Guid.NewGuid(), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.NotFound);
    }

    [Fact]
    public async Task Retorna_conflict_quando_tarefa_nao_esta_concluida()
    {
        Tarefa tarefa = Tarefa.Criar(_usuarioId, "X", Prioridade.Normal, DataDefault).Value!;
        _tarefas.Setup(t => t.ObterPorIdAsync(tarefa.Id, _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tarefa);

        Result<TarefaViewModel> result = await Criar().ExecuteAsync(tarefa.Id, CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Code.Should().Be("tarefa.nao-concluida-para-reabrir");
        result.Error.Type.Should().Be(ErrorType.Conflict);
    }
}
