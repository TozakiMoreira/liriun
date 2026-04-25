using FluentAssertions;
using Jarvis.Application.InputModels.Tarefas;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.UseCases.Tarefas;
using Jarvis.Application.ViewModels.Tarefas;
using Jarvis.Core.Entities;
using Jarvis.Core.Enums;
using Jarvis.Core.Exceptions;
using Jarvis.Core.Interfaces.Repositories;
using Moq;

namespace Jarvis.Application.Tests.UseCases.Tarefas;

public class AtualizarTarefaUseCaseTests
{
    private readonly Mock<ITarefaRepository> _tarefas = new();
    private readonly Mock<IPrazoRepository> _prazos = new();
    private readonly Mock<ICategoriaRepository> _categorias = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Guid _usuarioId = Guid.NewGuid();

    public AtualizarTarefaUseCaseTests()
    {
        _usuarioLogado.SetupGet(u => u.Id).Returns(_usuarioId);
        _categorias.Setup(c => c.TodasPertencemAoUsuario(It.IsAny<IEnumerable<Guid>>(), _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
    }

    private AtualizarTarefaUseCase Criar() => new(_tarefas.Object, _prazos.Object, _categorias.Object, _usuarioLogado.Object);

    [Fact]
    public async Task Atualiza_tarefa_existente()
    {
        Tarefa tarefa = new(_usuarioId, "Antigo", Prioridade.Normal);
        _tarefas.Setup(t => t.ObterPorId(tarefa.Id, _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tarefa);

        TarefaViewModel result = await Criar().Executar(
            tarefa.Id, new AtualizarTarefaInput("Novo", Prioridade.Urgente));

        result.Nome.Should().Be("Novo");
        result.Prioridade.Should().Be(Prioridade.Urgente);
        _tarefas.Verify(r => r.Atualizar(
            It.Is<Tarefa>(t => t.Nome == "Novo" && t.Prioridade == Prioridade.Urgente),
            It.IsAny<IEnumerable<Guid>>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Lanca_404_quando_nao_existe()
    {
        _tarefas.Setup(t => t.ObterPorId(It.IsAny<Guid>(), _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tarefa?)null);

        Func<Task> act = () => Criar().Executar(
            Guid.NewGuid(), new AtualizarTarefaInput("X", Prioridade.Normal));

        (await act.Should().ThrowAsync<ApplicationLayerException>())
            .Which.StatusCode.Should().Be(404);
    }
}
