using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Jarvis.Application.InputModels.Prazos;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ReadRepositories;
using Jarvis.Application.UseCases.Prazos;
using Jarvis.Application.ViewModels.Prazos;
using Jarvis.Core.Common;
using Jarvis.Core.Entities;
using Jarvis.Core.Interfaces.Repositories;
using Moq;

namespace Jarvis.Application.Tests.UseCases.Prazos;

public class AtualizarPrazoUseCaseTests
{
    private readonly Mock<IPrazoRepository> _repo = new();
    private readonly Mock<IPrazoReadRepository> _readRepo = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Mock<IValidator<AtualizarPrazoInput>> _validator = new();
    private readonly Guid _usuarioId = Guid.NewGuid();

    public AtualizarPrazoUseCaseTests()
    {
        _usuarioLogado.SetupGet(u => u.Id).Returns(_usuarioId);
        _validator.Setup(v => v.ValidateAsync(It.IsAny<AtualizarPrazoInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());
    }

    private AtualizarPrazoUseCase Criar()
        => new(_repo.Object, _readRepo.Object, _usuarioLogado.Object, _validator.Object);

    [Fact]
    public async Task Atualiza_quando_nome_disponivel()
    {
        Prazo prazo = Prazo.Criar(_usuarioId, "Hoje", 0).Value!;
        _repo.Setup(r => r.ObterPorIdAsync(prazo.Id, _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(prazo);
        _readRepo.Setup(r => r.ExisteOutraComNomeAsync(_usuarioId, "Amanha", prazo.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _repo.Setup(r => r.AtualizarAsync(It.IsAny<Prazo>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Prazo p, CancellationToken _) => p);

        Result<PrazoViewModel> result = await Criar().ExecuteAsync(
            prazo.Id, new AtualizarPrazoInput("Amanha", 1), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Nome.Should().Be("Amanha");
        result.Value.DuracaoDias.Should().Be(1);
    }

    [Fact]
    public async Task Retorna_not_found_quando_prazo_nao_existe()
    {
        _repo.Setup(r => r.ObterPorIdAsync(It.IsAny<Guid>(), _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Prazo?)null);

        Result<PrazoViewModel> result = await Criar().ExecuteAsync(
            Guid.NewGuid(), new AtualizarPrazoInput("Qualquer", 1), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.NotFound);
    }

    [Fact]
    public async Task Retorna_conflict_quando_outro_prazo_ja_tem_o_nome()
    {
        Prazo prazo = Prazo.Criar(_usuarioId, "Hoje", 0).Value!;
        _repo.Setup(r => r.ObterPorIdAsync(prazo.Id, _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(prazo);
        _readRepo.Setup(r => r.ExisteOutraComNomeAsync(_usuarioId, "Amanha", prazo.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        Result<PrazoViewModel> result = await Criar().ExecuteAsync(
            prazo.Id, new AtualizarPrazoInput("Amanha", 1), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.Conflict);
    }
}
