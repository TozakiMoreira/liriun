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

public class AtualizarPrazoUseCaseTests
{
    private readonly Mock<IPrazoRepository> _repo = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Guid _usuarioId = Guid.NewGuid();

    public AtualizarPrazoUseCaseTests()
    {
        _usuarioLogado.SetupGet(u => u.Id).Returns(_usuarioId);
    }

    private AtualizarPrazoUseCase Criar() => new(_repo.Object, _usuarioLogado.Object);

    private Prazo CriarPrazo(string nome = "Hoje", int? dur = 0) => new(_usuarioId, nome, dur);

    [Fact]
    public async Task Atualiza_quando_nome_disponivel()
    {
        Prazo prazo = CriarPrazo("Hoje", 0);
        _repo.Setup(r => r.ObterPorId(prazo.Id, _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(prazo);
        _repo.Setup(r => r.ExisteOutraComNome(_usuarioId, "Amanhã", prazo.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        PrazoViewModel result = await Criar().Executar(prazo.Id, new AtualizarPrazoInput("Amanhã", 1));

        result.Nome.Should().Be("Amanhã");
        result.DuracaoDias.Should().Be(1);
        _repo.Verify(r => r.Atualizar(It.Is<Prazo>(p => p.Nome == "Amanhã" && p.DuracaoDias == 1), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Lanca_404_quando_prazo_nao_existe()
    {
        _repo.Setup(r => r.ObterPorId(It.IsAny<Guid>(), _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Prazo?)null);

        Func<Task> act = () => Criar().Executar(Guid.NewGuid(), new AtualizarPrazoInput("Qualquer", 1));

        (await act.Should().ThrowAsync<ApplicationLayerException>())
            .Which.StatusCode.Should().Be(404);
    }

    [Fact]
    public async Task Lanca_409_quando_outro_prazo_ja_tem_o_nome()
    {
        Prazo prazo = CriarPrazo("Hoje", 0);
        _repo.Setup(r => r.ObterPorId(prazo.Id, _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(prazo);
        _repo.Setup(r => r.ExisteOutraComNome(_usuarioId, "Amanhã", prazo.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        Func<Task> act = () => Criar().Executar(prazo.Id, new AtualizarPrazoInput("Amanhã", 1));

        (await act.Should().ThrowAsync<ApplicationLayerException>())
            .Which.StatusCode.Should().Be(409);

        _repo.Verify(r => r.Atualizar(It.IsAny<Prazo>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
