using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Jarvis.Application.InputModels.Auth;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.UseCases.Auth;
using Jarvis.Core.Common;
using Jarvis.Core.Entities;
using Jarvis.Core.Interfaces.Repositories;
using Moq;

namespace Jarvis.Application.Tests.UseCases.Auth;

public class AlterarSenhaUseCaseTests
{
    private readonly Mock<IUsuarioRepository> _usuarios = new();
    private readonly Mock<IPasswordHasher> _hasher = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Mock<IValidator<AlterarSenhaInput>> _validator = new();
    private readonly Usuario _usuario;

    public AlterarSenhaUseCaseTests()
    {
        _usuario = Usuario.Criar("Lucas", "lucas@ex.com", "hash-antigo").Value!;
        _usuarioLogado.SetupGet(u => u.Id).Returns(_usuario.Id);
        _validator.Setup(v => v.ValidateAsync(It.IsAny<AlterarSenhaInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());
    }

    private AlterarSenhaUseCase Criar()
        => new(_usuarios.Object, _hasher.Object, _usuarioLogado.Object, _validator.Object);

    [Fact]
    public async Task Altera_senha_quando_senha_atual_bate()
    {
        _usuarios.Setup(r => r.ObterPorIdAsync(_usuario.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(_usuario);
        _hasher.Setup(h => h.Verificar("antiga123!", "hash-antigo")).Returns(true);
        _hasher.Setup(h => h.Hash("NovaSenha1!")).Returns("hash-novo");

        Result result = await Criar().ExecuteAsync(
            new AlterarSenhaInput("antiga123!", "NovaSenha1!"), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        _usuario.SenhaHash.Should().Be("hash-novo");
        _usuarios.Verify(r => r.AtualizarAsync(_usuario, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Retorna_validation_quando_senha_atual_incorreta()
    {
        _usuarios.Setup(r => r.ObterPorIdAsync(_usuario.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(_usuario);
        _hasher.Setup(h => h.Verificar("errada", It.IsAny<string>())).Returns(false);

        Result result = await Criar().ExecuteAsync(
            new AlterarSenhaInput("errada", "NovaSenha1!"), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Code.Should().Be("usuario.senha-atual-incorreta");
        _usuarios.Verify(r => r.AtualizarAsync(It.IsAny<Usuario>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Retorna_not_found_quando_usuario_nao_existe()
    {
        _usuarios.Setup(r => r.ObterPorIdAsync(_usuario.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Usuario?)null);

        Result result = await Criar().ExecuteAsync(
            new AlterarSenhaInput("x", "NovaSenha1!"), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.NotFound);
    }

    [Fact]
    public async Task Retorna_validation_quando_validator_reclama()
    {
        _validator.Setup(v => v.ValidateAsync(It.IsAny<AlterarSenhaInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult(new[]
            {
                new ValidationFailure("NovaSenha", "A senha precisa ter ao menos 1 letra maiuscula")
            }));

        Result result = await Criar().ExecuteAsync(
            new AlterarSenhaInput("antiga", "fraca"), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.Validation);
        _usuarios.Verify(r => r.ObterPorIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
