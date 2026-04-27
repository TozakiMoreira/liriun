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

public class CriarTarefaUseCaseTests
{
    private readonly Mock<ITarefaRepository> _tarefas = new();
    private readonly Mock<IPrazoRepository> _prazos = new();
    private readonly Mock<ICategoriaReadRepository> _categoriaRead = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Mock<IValidator<CriarTarefaInput>> _validator = new();
    private readonly Guid _usuarioId = Guid.NewGuid();

    public CriarTarefaUseCaseTests()
    {
        _usuarioLogado.SetupGet(u => u.Id).Returns(_usuarioId);
        _validator.Setup(v => v.ValidateAsync(It.IsAny<CriarTarefaInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());
        _categoriaRead.Setup(c => c.TodasPertencemAoUsuarioAsync(It.IsAny<IEnumerable<Guid>>(), _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _tarefas.Setup(t => t.AdicionarAsync(It.IsAny<Tarefa>(), It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tarefa t, IEnumerable<Guid> _, CancellationToken __) => t);
    }

    private CriarTarefaUseCase Criar()
        => new(_tarefas.Object, _prazos.Object, _categoriaRead.Object, _usuarioLogado.Object, _validator.Object);

    [Fact]
    public async Task Cria_tarefa_sem_prazo()
    {
        Result<TarefaViewModel> result = await Criar().ExecuteAsync(
            new CriarTarefaInput("Comprar pao", Prioridade.Normal), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Nome.Should().Be("Comprar pao");
        result.Value.Prioridade.Should().Be(Prioridade.Normal);
    }

    [Fact]
    public async Task Cria_tarefa_com_prazo_template_resolvendo_data()
    {
        Prazo prazo = Prazo.Criar(_usuarioId, "Amanha", 1).Value!;
        _prazos.Setup(p => p.ObterPorIdAsync(prazo.Id, _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(prazo);

        Result<TarefaViewModel> result = await Criar().ExecuteAsync(
            new CriarTarefaInput("Tarefa X", Prioridade.Importante, PrazoId: prazo.Id), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.PrazoId.Should().Be(prazo.Id);
        result.Value.DataPrazo.Should().NotBeNull();
        result.Value.DataPrazo!.Value.Date.Should().Be(DateTime.UtcNow.Date.AddDays(1));
    }

    [Fact]
    public async Task Cria_tarefa_com_data_custom()
    {
        DateTime dataCustom = DateTime.UtcNow.Date.AddDays(3);

        Result<TarefaViewModel> result = await Criar().ExecuteAsync(
            new CriarTarefaInput("Tarefa Y", Prioridade.Baixa, DataPrazoCustom: dataCustom), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.PrazoId.Should().BeNull();
        result.Value.DataPrazo.Should().Be(dataCustom);
    }

    [Fact]
    public async Task Retorna_validation_quando_categoria_nao_pertence_ao_usuario()
    {
        _categoriaRead.Setup(c => c.TodasPertencemAoUsuarioAsync(It.IsAny<IEnumerable<Guid>>(), _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        Result<TarefaViewModel> result = await Criar().ExecuteAsync(
            new CriarTarefaInput("X", Prioridade.Normal, CategoriaIds: new[] { Guid.NewGuid() }), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Code.Should().Be("tarefa.categorias-invalidas");
    }

    [Fact]
    public async Task Retorna_not_found_quando_prazo_nao_existe()
    {
        _prazos.Setup(p => p.ObterPorIdAsync(It.IsAny<Guid>(), _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Prazo?)null);

        Result<TarefaViewModel> result = await Criar().ExecuteAsync(
            new CriarTarefaInput("X", Prioridade.Normal, PrazoId: Guid.NewGuid()), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Code.Should().Be("tarefa.prazo-nao-encontrado");
    }
}
