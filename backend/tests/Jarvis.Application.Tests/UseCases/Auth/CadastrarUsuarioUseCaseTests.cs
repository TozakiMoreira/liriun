using FluentAssertions;
using Jarvis.Application.InputModels.Auth;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.UseCases.Auth;
using Jarvis.Core.Entities;
using Jarvis.Core.Exceptions;
using Jarvis.Core.Interfaces.Repositories;
using Moq;

namespace Jarvis.Application.Tests.UseCases.Auth;

public class CadastrarUsuarioUseCaseTests
{
    private readonly Mock<IUsuarioRepository> _usuarios = new();
    private readonly Mock<IPasswordHasher> _hasher = new();
    private readonly Mock<IJwtTokenService> _jwt = new();

    private CadastrarUsuarioUseCase Criar() => new(_usuarios.Object, _hasher.Object, _jwt.Object);

    [Fact]
    public async Task Cadastra_usuario_e_retorna_token_quando_email_livre()
    {
        _usuarios.Setup(r => r.ExisteEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _hasher.Setup(h => h.Hash("senha1234")).Returns("hash-fake");
        _jwt.Setup(j => j.Gerar(It.IsAny<Usuario>()))
            .Returns(("token-fake", DateTime.UtcNow.AddHours(24)));

        var input = new CadastrarUsuarioInput("Pedro", "pedro@ex.com", "senha1234");
        var result = await Criar().ExecutarAsync(input);

        result.Token.Should().Be("token-fake");
        result.Email.Should().Be("pedro@ex.com");
        _usuarios.Verify(r => r.AdicionarAsync(It.Is<Usuario>(u => u.SenhaHash == "hash-fake"), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Lanca_excecao_quando_email_ja_existe()
    {
        _usuarios.Setup(r => r.ExisteEmailAsync("pedro@ex.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var input = new CadastrarUsuarioInput("Pedro", "pedro@ex.com", "senha1234");

        var act = () => Criar().ExecutarAsync(input);

        (await act.Should().ThrowAsync<ApplicationLayerException>())
            .Which.StatusCode.Should().Be(409);
    }

    [Theory]
    [InlineData("", "pedro@ex.com", "senha1234")]
    [InlineData("Pedro", "email-invalido", "senha1234")]
    [InlineData("Pedro", "pedro@ex.com", "curto")]
    public void InputModel_rejeita_dados_invalidos(string nome, string email, string senha)
    {
        var act = () => new CadastrarUsuarioInput(nome, email, senha);
        act.Should().Throw<ApplicationLayerException>();
    }
}
