using FluentAssertions;
using Liriun.Application.Interfaces.Auth;
using Liriun.Application.UseCases.Tarefas;
using Liriun.Core.Common;
using Liriun.Core.Entities;
using Liriun.Core.Enums;
using Liriun.Core.Interfaces.Repositories;
using Moq;

namespace Liriun.Application.Tests.UseCases.Tarefas;

public class RemoverTarefaUseCaseTests
{
    private readonly Mock<ITarefaRepository> _tarefas = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Guid _usuarioId = Guid.NewGuid();

    public RemoverTarefaUseCaseTests()
    {
        _usuarioLogado.SetupGet(u => u.Id).Returns(_usuarioId);
    }

    private RemoverTarefaUseCase Criar() => new(_tarefas.Object, _usuarioLogado.Object);

    [Fact]
    public async Task Remove_quando_existe()
    {
        Tarefa tarefa = Tarefa.Criar(_usuarioId, "X", Prioridade.Normal, new DateTime(2026, 5, 10)).Value!;
        _tarefas.Setup(t => t.ObterPorIdAsync(tarefa.Id, _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tarefa);

        Result result = await Criar().ExecuteAsync(tarefa.Id, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        _tarefas.Verify(r => r.RemoverAsync(tarefa, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Retorna_not_found_quando_nao_existe()
    {
        _tarefas.Setup(t => t.ObterPorIdAsync(It.IsAny<Guid>(), _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tarefa?)null);

        Result result = await Criar().ExecuteAsync(Guid.NewGuid(), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.NotFound);
    }
}
