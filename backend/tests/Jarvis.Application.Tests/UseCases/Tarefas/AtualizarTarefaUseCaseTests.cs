using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Jarvis.Application.InputModels.Tarefas;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ReadRepositories;
using Jarvis.Application.UseCases.Tarefas;
using Jarvis.Application.ViewModels.Tarefas;
using Jarvis.Core.Common;
using Jarvis.Core.Entities;
using Jarvis.Core.Enums;
using Jarvis.Core.Interfaces.Repositories;
using Moq;

namespace Jarvis.Application.Tests.UseCases.Tarefas;

public class AtualizarTarefaUseCaseTests
{
    private readonly Mock<ITarefaRepository> _tarefas = new();
    private readonly Mock<IPrazoRepository> _prazos = new();
    private readonly Mock<ICategoriaReadRepository> _categoriaRead = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Mock<IValidator<AtualizarTarefaInput>> _validator = new();
    private readonly Guid _usuarioId = Guid.NewGuid();

    public AtualizarTarefaUseCaseTests()
    {
        _usuarioLogado.SetupGet(u => u.Id).Returns(_usuarioId);
        _validator.Setup(v => v.ValidateAsync(It.IsAny<AtualizarTarefaInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());
        _categoriaRead.Setup(c => c.TodasPertencemAoUsuarioAsync(It.IsAny<IEnumerable<Guid>>(), _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _tarefas.Setup(t => t.AtualizarAsync(It.IsAny<Tarefa>(), It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tarefa t, IEnumerable<Guid> _, CancellationToken __) => t);
    }

    private AtualizarTarefaUseCase Criar()
        => new(_tarefas.Object, _prazos.Object, _categoriaRead.Object, _usuarioLogado.Object, _validator.Object);

    [Fact]
    public async Task Atualiza_tarefa_existente()
    {
        Tarefa tarefa = Tarefa.Criar(_usuarioId, "Antigo", Prioridade.Normal).Value!;
        _tarefas.Setup(t => t.ObterPorIdAsync(tarefa.Id, _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tarefa);

        Result<TarefaViewModel> result = await Criar().ExecuteAsync(
            tarefa.Id, new AtualizarTarefaInput("Novo", Prioridade.Urgente), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Nome.Should().Be("Novo");
        result.Value.Prioridade.Should().Be(Prioridade.Urgente);
    }

    [Fact]
    public async Task Retorna_not_found_quando_nao_existe()
    {
        _tarefas.Setup(t => t.ObterPorIdAsync(It.IsAny<Guid>(), _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tarefa?)null);

        Result<TarefaViewModel> result = await Criar().ExecuteAsync(
            Guid.NewGuid(), new AtualizarTarefaInput("X", Prioridade.Normal), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.NotFound);
    }
}
