using FluentAssertions;
using Liriun.Application.Interfaces.Auth;
using Liriun.Application.UseCases.Tarefas;
using Liriun.Application.ViewModels.Tarefas;
using Liriun.Core.Common;
using Liriun.Core.Entities;
using Liriun.Core.Enums;
using Liriun.Core.Interfaces.Repositories;
using Moq;

namespace Liriun.Application.Tests.UseCases.Tarefas;

public class ConcluirTarefaUseCaseTests
{
    private readonly Mock<ITarefaRepository> _tarefas = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Guid _usuarioId = Guid.NewGuid();

    public ConcluirTarefaUseCaseTests()
    {
        _usuarioLogado.SetupGet(u => u.Id).Returns(_usuarioId);
        _tarefas.Setup(t => t.AtualizarAsync(It.IsAny<Tarefa>(), It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tarefa t, IEnumerable<Guid> _, CancellationToken __) => t);
    }

    private ConcluirTarefaUseCase Criar() => new(_tarefas.Object, _usuarioLogado.Object);

    [Fact]
    public async Task Conclui_tarefa_pendente()
    {
        Tarefa tarefa = Tarefa.Criar(_usuarioId, "X", Prioridade.Normal, new DateTime(2026, 5, 10)).Value!;
        _tarefas.Setup(t => t.ObterPorIdAsync(tarefa.Id, _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tarefa);

        Result<TarefaViewModel> result = await Criar().ExecuteAsync(tarefa.Id, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Status.Should().Be(StatusTarefa.Concluida);
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
    public async Task Retorna_conflict_quando_ja_concluida()
    {
        Tarefa tarefa = Tarefa.Criar(_usuarioId, "X", Prioridade.Normal, new DateTime(2026, 5, 10)).Value!;
        tarefa.Concluir();
        _tarefas.Setup(t => t.ObterPorIdAsync(tarefa.Id, _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tarefa);

        Result<TarefaViewModel> result = await Criar().ExecuteAsync(tarefa.Id, CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Code.Should().Be("tarefa.ja-concluida");
        result.Error.Type.Should().Be(ErrorType.Conflict);
    }
}
