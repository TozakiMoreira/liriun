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

public class CriarTarefaUseCaseTests
{
    private readonly Mock<ITarefaRepository> _tarefas = new();
    private readonly Mock<IPrazoRepository> _prazos = new();
    private readonly Mock<ICategoriaRepository> _categorias = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Guid _usuarioId = Guid.NewGuid();

    public CriarTarefaUseCaseTests()
    {
        _usuarioLogado.SetupGet(u => u.Id).Returns(_usuarioId);
        _categorias.Setup(c => c.TodasPertencemAoUsuario(It.IsAny<IEnumerable<Guid>>(), _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
    }

    private CriarTarefaUseCase Criar() => new(_tarefas.Object, _prazos.Object, _categorias.Object, _usuarioLogado.Object);

    [Fact]
    public async Task Cria_tarefa_sem_prazo()
    {
        TarefaViewModel result = await Criar().Executar(
            new CriarTarefaInput("Comprar pão", Prioridade.Normal));

        result.Nome.Should().Be("Comprar pão");
        result.Prioridade.Should().Be(Prioridade.Normal);
        _tarefas.Verify(r => r.Adicionar(
            It.Is<Tarefa>(t => t.UsuarioId == _usuarioId && t.Nome == "Comprar pão"),
            It.IsAny<IEnumerable<Guid>>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Cria_tarefa_com_prazo_template_resolvendo_data()
    {
        Prazo prazo = new(_usuarioId, "Amanhã", 1);
        _prazos.Setup(p => p.ObterPorId(prazo.Id, _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(prazo);

        TarefaViewModel result = await Criar().Executar(
            new CriarTarefaInput("Tarefa X", Prioridade.Importante, prazoId: prazo.Id));

        result.PrazoId.Should().Be(prazo.Id);
        result.DataPrazo.Should().NotBeNull();
        result.DataPrazo!.Value.Date.Should().Be(DateTime.UtcNow.Date.AddDays(1));
    }

    [Fact]
    public async Task Cria_tarefa_com_data_custom()
    {
        DateTime dataCustom = DateTime.UtcNow.Date.AddDays(3);

        TarefaViewModel result = await Criar().Executar(
            new CriarTarefaInput("Tarefa Y", Prioridade.Baixa, dataPrazoCustom: dataCustom));

        result.PrazoId.Should().BeNull();
        result.DataPrazo.Should().Be(dataCustom);
    }

    [Fact]
    public async Task Lanca_400_quando_categoria_nao_pertence_ao_usuario()
    {
        _categorias.Setup(c => c.TodasPertencemAoUsuario(It.IsAny<IEnumerable<Guid>>(), _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        Func<Task> act = () => Criar().Executar(
            new CriarTarefaInput("X", Prioridade.Normal, categoriaIds: new[] { Guid.NewGuid() }));

        (await act.Should().ThrowAsync<ApplicationLayerException>())
            .Which.StatusCode.Should().Be(400);
    }

    [Fact]
    public async Task Lanca_400_quando_prazo_nao_existe()
    {
        _prazos.Setup(p => p.ObterPorId(It.IsAny<Guid>(), _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Prazo?)null);

        Func<Task> act = () => Criar().Executar(
            new CriarTarefaInput("X", Prioridade.Normal, prazoId: Guid.NewGuid()));

        (await act.Should().ThrowAsync<ApplicationLayerException>())
            .Which.StatusCode.Should().Be(400);
    }

    [Fact]
    public void InputModel_rejeita_prazoId_e_dataCustom_juntos()
    {
        Action act = () => new CriarTarefaInput(
            "X", Prioridade.Normal,
            prazoId: Guid.NewGuid(),
            dataPrazoCustom: DateTime.UtcNow);

        act.Should().Throw<ApplicationLayerException>();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void InputModel_rejeita_nome_vazio(string nome)
    {
        Action act = () => new CriarTarefaInput(nome, Prioridade.Normal);
        act.Should().Throw<ApplicationLayerException>();
    }
}
