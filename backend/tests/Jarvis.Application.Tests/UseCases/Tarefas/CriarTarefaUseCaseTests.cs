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
    private readonly Mock<ICategoriaReadRepository> _categoriaRead = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Mock<IValidator<CriarTarefaInput>> _validator = new();
    private readonly Guid _usuarioId = Guid.NewGuid();
    private static readonly DateTime DataDefault = new(2026, 5, 10);

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
        => new(_tarefas.Object, _categoriaRead.Object, _usuarioLogado.Object, _validator.Object);

    [Fact]
    public async Task Cria_tarefa_com_data_obrigatoria()
    {
        Result<TarefaViewModel> result = await Criar().ExecuteAsync(
            new CriarTarefaInput("Comprar pao", Prioridade.Normal, DataDefault), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Nome.Should().Be("Comprar pao");
        result.Value.Prioridade.Should().Be(Prioridade.Normal);
        result.Value.DataPrazo.Should().Be(DataDefault);
        result.Value.HorarioFinal.Should().BeNull();
    }

    [Fact]
    public async Task Cria_tarefa_com_data_e_hora()
    {
        DateTime dataPrazo = new(2026, 5, 1);
        TimeSpan hora = new(14, 30, 0);

        Result<TarefaViewModel> result = await Criar().ExecuteAsync(
            new CriarTarefaInput("Tarefa X", Prioridade.Importante, dataPrazo, HorarioFinal: hora), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.DataPrazo.Should().Be(dataPrazo);
        result.Value.HorarioFinal.Should().Be(hora);
    }

    [Fact]
    public async Task Cria_tarefa_com_observacoes()
    {
        Result<TarefaViewModel> result = await Criar().ExecuteAsync(
            new CriarTarefaInput("Tarefa Z", Prioridade.Normal, DataDefault, Observacoes: "Levar a chave reserva"),
            CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Observacoes.Should().Be("Levar a chave reserva");
    }

    [Fact]
    public async Task Retorna_validation_quando_categoria_nao_pertence_ao_usuario()
    {
        _categoriaRead.Setup(c => c.TodasPertencemAoUsuarioAsync(It.IsAny<IEnumerable<Guid>>(), _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        Result<TarefaViewModel> result = await Criar().ExecuteAsync(
            new CriarTarefaInput("X", Prioridade.Normal, DataDefault, CategoriaIds: new[] { Guid.NewGuid() }),
            CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Code.Should().Be("tarefa.categorias-invalidas");
    }
}
