using FluentAssertions;
using Jarvis.Application.InputModels.Auth;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.UseCases.Auth;
using Jarvis.Application.ViewModels.Auth;
using Jarvis.Core.Entities;
using Jarvis.Core.Exceptions;
using Jarvis.Core.Interfaces.Repositories;
using Moq;

namespace Jarvis.Application.Tests.UseCases.Auth;

public class LoginUseCaseTests
{
    private readonly Mock<IUsuarioRepository> _usuarios = new();
    private readonly Mock<IPasswordHasher> _hasher = new();
    private readonly Mock<IJwtTokenService> _jwt = new();

    private LoginUseCase Criar() => new(_usuarios.Object, _hasher.Object, _jwt.Object);

    [Fact]
    public async Task Retorna_token_quando_credenciais_corretas()
    {
        Usuario usuario = new("Pedro", "pedro@ex.com", "hash-valido");
        _usuarios.Setup(r => r.ObterPorEmail("pedro@ex.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(usuario);
        _hasher.Setup(h => h.Verificar("senha1234", "hash-valido")).Returns(true);
        _jwt.Setup(j => j.Gerar(usuario))
            .Returns(("token-fake", DateTime.UtcNow.AddHours(24)));

        AutenticacaoViewModel result = await Criar().Executar(new LoginInput("pedro@ex.com", "senha1234"));

        result.Token.Should().Be("token-fake");
        result.UsuarioId.Should().Be(usuario.Id);
    }

    [Fact]
    public async Task Lanca_401_quando_usuario_nao_existe()
    {
        _usuarios.Setup(r => r.ObterPorEmail(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Usuario?)null);

        Func<Task> act = () => Criar().Executar(new LoginInput("nao@existe.com", "senha1234"));

        (await act.Should().ThrowAsync<ApplicationLayerException>())
            .Which.StatusCode.Should().Be(401);
    }

    [Fact]
    public async Task Lanca_401_quando_senha_invalida()
    {
        Usuario usuario = new("Pedro", "pedro@ex.com", "hash-valido");
        _usuarios.Setup(r => r.ObterPorEmail("pedro@ex.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(usuario);
        _hasher.Setup(h => h.Verificar(It.IsAny<string>(), It.IsAny<string>())).Returns(false);

        Func<Task> act = () => Criar().Executar(new LoginInput("pedro@ex.com", "senha-errada"));

        (await act.Should().ThrowAsync<ApplicationLayerException>())
            .Which.StatusCode.Should().Be(401);
    }
}
