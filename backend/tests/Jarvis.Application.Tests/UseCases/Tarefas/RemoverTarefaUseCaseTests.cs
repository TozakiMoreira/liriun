using FluentAssertions;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.UseCases.Tarefas;
using Jarvis.Core.Entities;
using Jarvis.Core.Enums;
using Jarvis.Core.Exceptions;
using Jarvis.Core.Interfaces.Repositories;
using Moq;

namespace Jarvis.Application.Tests.UseCases.Tarefas;

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
        Tarefa tarefa = new(_usuarioId, "X", Prioridade.Normal);
        _tarefas.Setup(t => t.ObterPorId(tarefa.Id, _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tarefa);

        await Criar().Executar(tarefa.Id);

        _tarefas.Verify(r => r.Remover(tarefa, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Lanca_404_quando_nao_existe()
    {
        _tarefas.Setup(t => t.ObterPorId(It.IsAny<Guid>(), _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tarefa?)null);

        Func<Task> act = () => Criar().Executar(Guid.NewGuid());

        (await act.Should().ThrowAsync<ApplicationLayerException>())
            .Which.StatusCode.Should().Be(404);
    }
}
