using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Liriun.Application.InputModels.Auth;
using Liriun.Application.Interfaces.Auth;
using Liriun.Application.UseCases.Auth;
using Liriun.Core.Common;
using Liriun.Core.Entities;
using Liriun.Core.Interfaces.Repositories;
using Moq;

namespace Liriun.Application.Tests.UseCases.Auth;

public class ExcluirContaUseCaseTests
{
    private readonly Mock<IUsuarioRepository> _usuarios = new();
    private readonly Mock<IPasswordHasher> _hasher = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Mock<IValidator<ExcluirContaInput>> _validator = new();
    private readonly Usuario _usuario;

    public ExcluirContaUseCaseTests()
    {
        _usuario = Usuario.Criar("Lucas", "lucas@ex.com", "hash-bom").Value!;
        _usuarioLogado.SetupGet(u => u.Id).Returns(_usuario.Id);
        _validator.Setup(v => v.ValidateAsync(It.IsAny<ExcluirContaInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());
    }

    private ExcluirContaUseCase Criar()
        => new(_usuarios.Object, _hasher.Object, _usuarioLogado.Object, _validator.Object);

    [Fact]
    public async Task Exclui_quando_senha_confere()
    {
        _usuarios.Setup(r => r.ObterPorIdAsync(_usuario.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(_usuario);
        _hasher.Setup(h => h.Verificar("senha-correta", "hash-bom")).Returns(true);

        Result result = await Criar().ExecuteAsync(
            new ExcluirContaInput("senha-correta"), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        _usuarios.Verify(r => r.RemoverAsync(_usuario.Id, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Retorna_validation_quando_senha_incorreta()
    {
        _usuarios.Setup(r => r.ObterPorIdAsync(_usuario.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(_usuario);
        _hasher.Setup(h => h.Verificar("errada", It.IsAny<string>())).Returns(false);

        Result result = await Criar().ExecuteAsync(
            new ExcluirContaInput("errada"), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Code.Should().Be("usuario.senha-atual-incorreta");
        _usuarios.Verify(r => r.RemoverAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Retorna_not_found_quando_usuario_nao_existe()
    {
        _usuarios.Setup(r => r.ObterPorIdAsync(_usuario.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Usuario?)null);

        Result result = await Criar().ExecuteAsync(
            new ExcluirContaInput("qualquer"), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.NotFound);
        _usuarios.Verify(r => r.RemoverAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Retorna_validation_quando_validator_reclama()
    {
        _validator.Setup(v => v.ValidateAsync(It.IsAny<ExcluirContaInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult(new[]
            {
                new ValidationFailure("Senha", "Confirma sua senha pra excluir a conta")
            }));

        Result result = await Criar().ExecuteAsync(
            new ExcluirContaInput(""), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.Validation);
        _usuarios.Verify(r => r.ObterPorIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
