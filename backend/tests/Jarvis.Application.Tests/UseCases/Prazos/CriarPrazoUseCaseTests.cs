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

public class CriarPrazoUseCaseTests
{
    private readonly Mock<IPrazoRepository> _repo = new();
    private readonly Mock<IPrazoReadRepository> _readRepo = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Mock<IValidator<CriarPrazoInput>> _validator = new();
    private readonly Guid _usuarioId = Guid.NewGuid();

    public CriarPrazoUseCaseTests()
    {
        _usuarioLogado.SetupGet(u => u.Id).Returns(_usuarioId);
        _validator.Setup(v => v.ValidateAsync(It.IsAny<CriarPrazoInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());
    }

    private CriarPrazoUseCase Criar() => new(_repo.Object, _readRepo.Object, _usuarioLogado.Object, _validator.Object);

    [Fact]
    public async Task Cria_prazo_quando_nome_nao_existe()
    {
        _readRepo.Setup(r => r.ExisteNomeAsync(_usuarioId, "Hoje", It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _repo.Setup(r => r.AdicionarAsync(It.IsAny<Prazo>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Prazo p, CancellationToken _) => p);

        Result<PrazoViewModel> result = await Criar().ExecuteAsync(new CriarPrazoInput("Hoje", 0), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Nome.Should().Be("Hoje");
        result.Value.DuracaoDias.Should().Be(0);
    }

    [Fact]
    public async Task Cria_prazo_sem_duracao()
    {
        _readRepo.Setup(r => r.ExisteNomeAsync(_usuarioId, "Sem prazo", It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _repo.Setup(r => r.AdicionarAsync(It.IsAny<Prazo>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Prazo p, CancellationToken _) => p);

        Result<PrazoViewModel> result = await Criar().ExecuteAsync(new CriarPrazoInput("Sem prazo", null), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.DuracaoDias.Should().BeNull();
    }

    [Fact]
    public async Task Retorna_conflict_quando_nome_ja_existe()
    {
        _readRepo.Setup(r => r.ExisteNomeAsync(_usuarioId, It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        Result<PrazoViewModel> result = await Criar().ExecuteAsync(new CriarPrazoInput("Hoje", 0), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.Conflict);
    }
}
