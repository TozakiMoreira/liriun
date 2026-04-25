using FluentAssertions;
using Jarvis.Application.InputModels.Prazos;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.UseCases.Prazos;
using Jarvis.Application.ViewModels.Prazos;
using Jarvis.Core.Entities;
using Jarvis.Core.Exceptions;
using Jarvis.Core.Interfaces.Repositories;
using Moq;

namespace Jarvis.Application.Tests.UseCases.Prazos;

public class CriarPrazoUseCaseTests
{
    private readonly Mock<IPrazoRepository> _repo = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Guid _usuarioId = Guid.NewGuid();

    public CriarPrazoUseCaseTests()
    {
        _usuarioLogado.SetupGet(u => u.Id).Returns(_usuarioId);
    }

    private CriarPrazoUseCase Criar() => new(_repo.Object, _usuarioLogado.Object);

    [Fact]
    public async Task Cria_prazo_quando_nome_nao_existe()
    {
        _repo.Setup(r => r.ExisteNome(_usuarioId, "Hoje", It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        PrazoViewModel result = await Criar().Executar(new CriarPrazoInput("Hoje", 0));

        result.Nome.Should().Be("Hoje");
        result.DuracaoDias.Should().Be(0);
        _repo.Verify(r => r.Adicionar(
            It.Is<Prazo>(p => p.UsuarioId == _usuarioId && p.Nome == "Hoje" && p.DuracaoDias == 0),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Cria_prazo_sem_duracao()
    {
        _repo.Setup(r => r.ExisteNome(_usuarioId, "Sem prazo", It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        PrazoViewModel result = await Criar().Executar(new CriarPrazoInput("Sem prazo", null));

        result.DuracaoDias.Should().BeNull();
    }

    [Fact]
    public async Task Lanca_409_quando_nome_ja_existe()
    {
        _repo.Setup(r => r.ExisteNome(_usuarioId, It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        Func<Task> act = () => Criar().Executar(new CriarPrazoInput("Hoje", 0));

        (await act.Should().ThrowAsync<ApplicationLayerException>())
            .Which.StatusCode.Should().Be(409);

        _repo.Verify(r => r.Adicionar(It.IsAny<Prazo>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void InputModel_rejeita_nome_vazio(string nome)
    {
        Action act = () => new CriarPrazoInput(nome, 1);
        act.Should().Throw<ApplicationLayerException>();
    }

    [Fact]
    public void InputModel_rejeita_nome_maior_que_50()
    {
        Action act = () => new CriarPrazoInput(new string('a', 51), 1);
        act.Should().Throw<ApplicationLayerException>();
    }

    [Fact]
    public void InputModel_rejeita_duracao_negativa()
    {
        Action act = () => new CriarPrazoInput("Hoje", -1);
        act.Should().Throw<ApplicationLayerException>();
    }
}
