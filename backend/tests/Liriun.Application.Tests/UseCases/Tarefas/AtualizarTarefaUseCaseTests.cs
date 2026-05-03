using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Liriun.Application.InputModels.Tarefas;
using Liriun.Application.Interfaces.Auth;
using Liriun.Application.ReadRepositories;
using Liriun.Application.UseCases.Tarefas;
using Liriun.Application.ViewModels.Tarefas;
using Liriun.Core.Common;
using Liriun.Core.Entities;
using Liriun.Core.Enums;
using Liriun.Core.Interfaces.Repositories;
using Moq;

namespace Liriun.Application.Tests.UseCases.Tarefas;

public class AtualizarTarefaUseCaseTests
{
    private readonly Mock<ITarefaRepository> _tarefas = new();
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
        => new(_tarefas.Object, _categoriaRead.Object, _usuarioLogado.Object, _validator.Object);

    private static readonly DateTime DataDefault = new(2026, 5, 10);

    [Fact]
    public async Task Atualiza_tarefa_existente()
    {
        Tarefa tarefa = Tarefa.Criar(_usuarioId, "Antigo", Prioridade.Normal, DataDefault).Value!;
        _tarefas.Setup(t => t.ObterPorIdAsync(tarefa.Id, _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tarefa);

        Result<TarefaViewModel> result = await Criar().ExecuteAsync(
            tarefa.Id, new AtualizarTarefaInput("Novo", Prioridade.Urgente, DataDefault, Observacoes: "obs"),
            CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Nome.Should().Be("Novo");
        result.Value.Prioridade.Should().Be(Prioridade.Urgente);
        result.Value.Observacoes.Should().Be("obs");
    }

    [Fact]
    public async Task Retorna_not_found_quando_nao_existe()
    {
        _tarefas.Setup(t => t.ObterPorIdAsync(It.IsAny<Guid>(), _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tarefa?)null);

        Result<TarefaViewModel> result = await Criar().ExecuteAsync(
            Guid.NewGuid(), new AtualizarTarefaInput("X", Prioridade.Normal, DataDefault), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.NotFound);
    }
}
