using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Liriun.Application.InputModels.Auth;
using Liriun.Application.Interfaces;
using Liriun.Application.Interfaces.Auth;
using Liriun.Application.ReadRepositories;
using Liriun.Application.UseCases.Auth;
using Liriun.Application.ViewModels.Auth;
using Liriun.Core.Common;
using Liriun.Core.Entities;
using Liriun.Core.Errors;
using Liriun.Core.Interfaces.Repositories;
using Moq;

namespace Liriun.Application.Tests.UseCases.Auth;

public class CadastrarUsuarioUseCaseTests
{
    private readonly Mock<IUsuarioRepository> _usuarios = new();
    private readonly Mock<IUsuarioReadRepository> _usuarioRead = new();
    private readonly Mock<ICodigoBetaRepository> _codigosBeta = new();
    private readonly Mock<IUnitOfWork> _uow = new();
    private readonly Mock<IPasswordHasher> _hasher = new();
    private readonly Mock<IJwtTokenService> _jwt = new();
    private readonly Mock<IValidator<CadastrarUsuarioInput>> _validator = new();

    public CadastrarUsuarioUseCaseTests()
    {
        _validator.Setup(v => v.ValidateAsync(It.IsAny<CadastrarUsuarioInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());

        // A transacao apenas executa a acao (sem banco real nos testes).
        _uow.Setup(u => u.ExecuteInTransactionAsync(
                It.IsAny<Func<CancellationToken, Task<Result<Usuario>>>>(), It.IsAny<CancellationToken>()))
            .Returns((Func<CancellationToken, Task<Result<Usuario>>> acao, CancellationToken ct) => acao(ct));

        // Por padrao, o codigo beta e valido (consumo com sucesso).
        _codigosBeta.Setup(r => r.ConsumirAtomicoAsync(
                It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success());
    }

    private CadastrarUsuarioUseCase Criar()
        => new(_usuarios.Object, _usuarioRead.Object, _codigosBeta.Object, _uow.Object, _hasher.Object, _jwt.Object, _validator.Object);

    [Fact]
    public async Task Cadastra_usuario_e_retorna_token_quando_email_livre_e_codigo_valido()
    {
        _usuarioRead.Setup(r => r.ExisteEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _hasher.Setup(h => h.Hash("senha1234")).Returns("hash-fake");
        _usuarios.Setup(r => r.AdicionarAsync(It.IsAny<Usuario>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Usuario u, CancellationToken _) => u);
        _jwt.Setup(j => j.Gerar(It.IsAny<Usuario>()))
            .Returns(("token-fake", DateTime.UtcNow.AddHours(24)));

        CadastrarUsuarioInput input = new("Pedro", "pedro@ex.com", "senha1234", true, "LRN-TESTE");
        Result<AutenticacaoViewModel> result = await Criar().ExecuteAsync(input, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Token.Should().Be("token-fake");
        result.Value.Email.Should().Be("pedro@ex.com");
        _codigosBeta.Verify(r => r.ConsumirAtomicoAsync(It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Retorna_conflict_quando_email_ja_existe()
    {
        _usuarioRead.Setup(r => r.ExisteEmailAsync("pedro@ex.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        CadastrarUsuarioInput input = new("Pedro", "pedro@ex.com", "senha1234", true, "LRN-TESTE");
        Result<AutenticacaoViewModel> result = await Criar().ExecuteAsync(input, CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Code.Should().Be("usuario.email-ja-cadastrado");
        result.Error.Type.Should().Be(ErrorType.Conflict);
        // Email duplicado nao deve consumir o codigo.
        _codigosBeta.Verify(r => r.ConsumirAtomicoAsync(It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Retorna_falha_e_nao_cria_usuario_quando_codigo_beta_invalido()
    {
        _usuarioRead.Setup(r => r.ExisteEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _hasher.Setup(h => h.Hash(It.IsAny<string>())).Returns("hash-fake");
        _codigosBeta.Setup(r => r.ConsumirAtomicoAsync(It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Failure(CodigoBetaErrors.CodigoInvalido()));

        CadastrarUsuarioInput input = new("Pedro", "pedro@ex.com", "senha1234", true, "LRN-INVALIDO");
        Result<AutenticacaoViewModel> result = await Criar().ExecuteAsync(input, CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Code.Should().Be("codigo-beta.invalido");
        _usuarios.Verify(r => r.AdicionarAsync(It.IsAny<Usuario>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Retorna_validation_error_quando_dados_invalidos()
    {
        _validator.Setup(v => v.ValidateAsync(It.IsAny<CadastrarUsuarioInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult(new[] { new ValidationFailure("Nome", "Nome e obrigatorio") }));

        CadastrarUsuarioInput input = new("", "pedro@ex.com", "senha1234", true, "LRN-TESTE");
        Result<AutenticacaoViewModel> result = await Criar().ExecuteAsync(input, CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.Validation);
    }
}
