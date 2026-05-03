using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Liriun.Application.InputModels.Auth;
using Liriun.Application.Interfaces.Auth;
using Liriun.Application.ReadRepositories;
using Liriun.Application.UseCases.Auth;
using Liriun.Application.ViewModels.Auth;
using Liriun.Core.Common;
using Liriun.Core.Entities;
using Liriun.Core.Interfaces.Repositories;
using Moq;

namespace Liriun.Application.Tests.UseCases.Auth;

public class AtualizarPerfilUseCaseTests
{
    private readonly Mock<IUsuarioRepository> _usuarios = new();
    private readonly Mock<IUsuarioReadRepository> _usuarioRead = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Mock<IValidator<AtualizarPerfilInput>> _validator = new();
    private readonly Usuario _usuario;

    public AtualizarPerfilUseCaseTests()
    {
        _usuario = Usuario.Criar("Lucas", "lucas@ex.com", "hash").Value!;
        _usuarioLogado.SetupGet(u => u.Id).Returns(_usuario.Id);
        _validator.Setup(v => v.ValidateAsync(It.IsAny<AtualizarPerfilInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());
        _usuarios.Setup(r => r.ObterPorIdAsync(_usuario.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(_usuario);
        _usuarios.Setup(r => r.AtualizarAsync(It.IsAny<Usuario>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Usuario u, CancellationToken _) => u);
    }

    private AtualizarPerfilUseCase Criar()
        => new(_usuarios.Object, _usuarioRead.Object, _usuarioLogado.Object, _validator.Object);

    [Fact]
    public async Task Atualiza_nome_sem_alterar_email()
    {
        Result<PerfilViewModel> result = await Criar().ExecuteAsync(
            new AtualizarPerfilInput("Lucas Eduardo", "lucas@ex.com"), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Nome.Should().Be("Lucas Eduardo");
        result.Value.Email.Should().Be("lucas@ex.com");
        _usuarioRead.Verify(
            r => r.ExisteEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Never,
            "se o email nao mudou nao precisa checar unicidade");
    }

    [Fact]
    public async Task Atualiza_email_quando_disponivel()
    {
        _usuarioRead.Setup(r => r.ExisteEmailAsync("novo@ex.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        Result<PerfilViewModel> result = await Criar().ExecuteAsync(
            new AtualizarPerfilInput("Lucas", "novo@ex.com"), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Email.Should().Be("novo@ex.com");
    }

    [Fact]
    public async Task Retorna_conflict_quando_email_ja_em_uso()
    {
        _usuarioRead.Setup(r => r.ExisteEmailAsync("usado@ex.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        Result<PerfilViewModel> result = await Criar().ExecuteAsync(
            new AtualizarPerfilInput("Lucas", "usado@ex.com"), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.Conflict);
        _usuarios.Verify(r => r.AtualizarAsync(It.IsAny<Usuario>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Retorna_not_found_quando_usuario_nao_existe()
    {
        _usuarios.Setup(r => r.ObterPorIdAsync(_usuario.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Usuario?)null);

        Result<PerfilViewModel> result = await Criar().ExecuteAsync(
            new AtualizarPerfilInput("X", "x@ex.com"), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.NotFound);
    }

    [Fact]
    public async Task Retorna_validation_quando_validator_reclama()
    {
        _validator.Setup(v => v.ValidateAsync(It.IsAny<AtualizarPerfilInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult(new[] { new ValidationFailure("Email", "Email em formato invalido") }));

        Result<PerfilViewModel> result = await Criar().ExecuteAsync(
            new AtualizarPerfilInput("X", "invalido"), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.Validation);
    }
}
