using FluentAssertions;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ReadRepositories;
using Jarvis.Application.UseCases.Prazos;
using Jarvis.Core.Common;
using Jarvis.Core.Entities;
using Jarvis.Core.Interfaces.Repositories;
using Moq;

namespace Jarvis.Application.Tests.UseCases.Prazos;

public class RemoverPrazoUseCaseTests
{
    private readonly Mock<IPrazoRepository> _repo = new();
    private readonly Mock<IPrazoReadRepository> _readRepo = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Guid _usuarioId = Guid.NewGuid();

    public RemoverPrazoUseCaseTests()
    {
        _usuarioLogado.SetupGet(u => u.Id).Returns(_usuarioId);
    }

    private RemoverPrazoUseCase Criar() => new(_repo.Object, _readRepo.Object, _usuarioLogado.Object);

    [Fact]
    public async Task Remove_quando_nao_tem_tarefa_pendente()
    {
        Prazo prazo = Prazo.Criar(_usuarioId, "Hoje", 0).Value!;
        _repo.Setup(r => r.ObterPorIdAsync(prazo.Id, _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(prazo);
        _readRepo.Setup(r => r.TemTarefaPendenteAsync(prazo.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        Result result = await Criar().ExecuteAsync(prazo.Id, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        _repo.Verify(r => r.RemoverAsync(prazo, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Retorna_not_found_quando_prazo_nao_existe()
    {
        _repo.Setup(r => r.ObterPorIdAsync(It.IsAny<Guid>(), _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Prazo?)null);

        Result result = await Criar().ExecuteAsync(Guid.NewGuid(), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.NotFound);
    }

    [Fact]
    public async Task Retorna_conflict_quando_tem_tarefa_pendente()
    {
        Prazo prazo = Prazo.Criar(_usuarioId, "Hoje", 0).Value!;
        _repo.Setup(r => r.ObterPorIdAsync(prazo.Id, _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(prazo);
        _readRepo.Setup(r => r.TemTarefaPendenteAsync(prazo.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        Result result = await Criar().ExecuteAsync(prazo.Id, CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.Conflict);
        _repo.Verify(r => r.RemoverAsync(It.IsAny<Prazo>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
