using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Liriun.Application.InputModels.Auth;
using Liriun.Application.Interfaces.Auth;
using Liriun.Application.UseCases.Auth;
using Liriun.Application.ViewModels.Auth;
using Liriun.Core.Common;
using Liriun.Core.Entities;
using Liriun.Core.Interfaces.Repositories;
using Moq;

namespace Liriun.Application.Tests.UseCases.Auth;

public class LoginUseCaseTests
{
    private readonly Mock<IUsuarioRepository> _usuarios = new();
    private readonly Mock<IPasswordHasher> _hasher = new();
    private readonly Mock<IJwtTokenService> _jwt = new();
    private readonly Mock<IValidator<LoginInput>> _validator = new();

    public LoginUseCaseTests()
    {
        _validator.Setup(v => v.ValidateAsync(It.IsAny<LoginInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());
    }

    private LoginUseCase Criar() => new(_usuarios.Object, _hasher.Object, _jwt.Object, _validator.Object);

    [Fact]
    public async Task Retorna_token_quando_credenciais_corretas()
    {
        Usuario usuario = Usuario.Criar("Pedro", "pedro@ex.com", "hash-valido").Value!;
        _usuarios.Setup(r => r.ObterPorEmailAsync("pedro@ex.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(usuario);
        _hasher.Setup(h => h.Verificar("senha1234", "hash-valido")).Returns(true);
        _jwt.Setup(j => j.Gerar(usuario))
            .Returns(("token-fake", DateTime.UtcNow.AddHours(24)));

        Result<AutenticacaoViewModel> result = await Criar().ExecuteAsync(
            new LoginInput("pedro@ex.com", "senha1234"), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Token.Should().Be("token-fake");
        result.Value.UsuarioId.Should().Be(usuario.Id);
    }

    [Fact]
    public async Task Retorna_unauthorized_quando_usuario_nao_existe()
    {
        _usuarios.Setup(r => r.ObterPorEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Usuario?)null);

        Result<AutenticacaoViewModel> result = await Criar().ExecuteAsync(
            new LoginInput("nao@existe.com", "senha1234"), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Code.Should().Be("usuario.credenciais-invalidas");
        result.Error.Type.Should().Be(ErrorType.Unauthorized);
    }

    [Fact]
    public async Task Retorna_unauthorized_quando_senha_invalida()
    {
        Usuario usuario = Usuario.Criar("Pedro", "pedro@ex.com", "hash-valido").Value!;
        _usuarios.Setup(r => r.ObterPorEmailAsync("pedro@ex.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(usuario);
        _hasher.Setup(h => h.Verificar(It.IsAny<string>(), It.IsAny<string>())).Returns(false);

        Result<AutenticacaoViewModel> result = await Criar().ExecuteAsync(
            new LoginInput("pedro@ex.com", "senha-errada"), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.Unauthorized);
    }
}
