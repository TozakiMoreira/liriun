using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Jarvis.Application.InputModels.Auth;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ReadRepositories;
using Jarvis.Application.UseCases.Auth;
using Jarvis.Application.ViewModels.Auth;
using Jarvis.Core.Common;
using Jarvis.Core.Entities;
using Jarvis.Core.Interfaces.Repositories;
using Moq;

namespace Jarvis.Application.Tests.UseCases.Auth;

public class CadastrarUsuarioUseCaseTests
{
    private readonly Mock<IUsuarioRepository> _usuarios = new();
    private readonly Mock<IUsuarioReadRepository> _usuarioRead = new();
    private readonly Mock<IPasswordHasher> _hasher = new();
    private readonly Mock<IJwtTokenService> _jwt = new();
    private readonly Mock<IValidator<CadastrarUsuarioInput>> _validator = new();

    public CadastrarUsuarioUseCaseTests()
    {
        _validator.Setup(v => v.ValidateAsync(It.IsAny<CadastrarUsuarioInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());
    }

    private CadastrarUsuarioUseCase Criar()
        => new(_usuarios.Object, _usuarioRead.Object, _hasher.Object, _jwt.Object, _validator.Object);

    [Fact]
    public async Task Cadastra_usuario_e_retorna_token_quando_email_livre()
    {
        _usuarioRead.Setup(r => r.ExisteEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _hasher.Setup(h => h.Hash("senha1234")).Returns("hash-fake");
        _usuarios.Setup(r => r.AdicionarAsync(It.IsAny<Usuario>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Usuario u, CancellationToken _) => u);
        _jwt.Setup(j => j.Gerar(It.IsAny<Usuario>()))
            .Returns(("token-fake", DateTime.UtcNow.AddHours(24)));

        CadastrarUsuarioInput input = new("Pedro", "pedro@ex.com", "senha1234");
        Result<AutenticacaoViewModel> result = await Criar().ExecuteAsync(input, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Token.Should().Be("token-fake");
        result.Value.Email.Should().Be("pedro@ex.com");
    }

    [Fact]
    public async Task Retorna_conflict_quando_email_ja_existe()
    {
        _usuarioRead.Setup(r => r.ExisteEmailAsync("pedro@ex.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        CadastrarUsuarioInput input = new("Pedro", "pedro@ex.com", "senha1234");
        Result<AutenticacaoViewModel> result = await Criar().ExecuteAsync(input, CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Code.Should().Be("usuario.email-ja-cadastrado");
        result.Error.Type.Should().Be(ErrorType.Conflict);
    }

    [Fact]
    public async Task Retorna_validation_error_quando_dados_invalidos()
    {
        _validator.Setup(v => v.ValidateAsync(It.IsAny<CadastrarUsuarioInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult(new[] { new ValidationFailure("Nome", "Nome e obrigatorio") }));

        CadastrarUsuarioInput input = new("", "pedro@ex.com", "senha1234");
        Result<AutenticacaoViewModel> result = await Criar().ExecuteAsync(input, CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.Validation);
    }
}
