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

public class AtualizarFotoPerfilUseCaseTests
{
    private readonly Mock<IUsuarioRepository> _usuarios = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Mock<IValidator<AtualizarFotoPerfilInput>> _validator = new();
    private readonly Usuario _usuario;
    private const string FotoValida = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";

    public AtualizarFotoPerfilUseCaseTests()
    {
        _usuario = Usuario.Criar("Lucas", "lucas@ex.com", "hash").Value!;
        _usuarioLogado.SetupGet(u => u.Id).Returns(_usuario.Id);
        _validator.Setup(v => v.ValidateAsync(It.IsAny<AtualizarFotoPerfilInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());
        _usuarios.Setup(r => r.ObterPorIdAsync(_usuario.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(_usuario);
        _usuarios.Setup(r => r.AtualizarAsync(It.IsAny<Usuario>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Usuario u, CancellationToken _) => u);
    }

    private AtualizarFotoPerfilUseCase Criar()
        => new(_usuarios.Object, _usuarioLogado.Object, _validator.Object);

    [Fact]
    public async Task Salva_foto_quando_valida()
    {
        Result<PerfilViewModel> result = await Criar().ExecuteAsync(
            new AtualizarFotoPerfilInput(FotoValida), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.FotoUrl.Should().Be(FotoValida);
        _usuario.FotoUrl.Should().Be(FotoValida);
        _usuarios.Verify(r => r.AtualizarAsync(_usuario, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Remove_foto_quando_input_null()
    {
        _usuario.AtualizarFotoPerfil(FotoValida);

        Result<PerfilViewModel> result = await Criar().ExecuteAsync(
            new AtualizarFotoPerfilInput(null), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.FotoUrl.Should().BeNull();
        _usuario.FotoUrl.Should().BeNull();
    }

    [Fact]
    public async Task Retorna_validation_quando_validator_falha()
    {
        _validator.Setup(v => v.ValidateAsync(It.IsAny<AtualizarFotoPerfilInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult(new[]
            {
                new ValidationFailure("FotoUrl", "Foto precisa estar em formato data:image/...")
            }));

        Result<PerfilViewModel> result = await Criar().ExecuteAsync(
            new AtualizarFotoPerfilInput("texto-qualquer"), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.Validation);
        _usuarios.Verify(r => r.AtualizarAsync(It.IsAny<Usuario>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Retorna_validation_quando_entidade_rejeita_formato()
    {
        // validator passa, mas a entidade rejeita (ex: prefixo errado escapou do validator)
        Result<PerfilViewModel> result = await Criar().ExecuteAsync(
            new AtualizarFotoPerfilInput("nao-eh-data-url"), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Code.Should().Be("usuario.foto-formato-invalido");
    }

    [Fact]
    public async Task Retorna_not_found_quando_usuario_nao_existe()
    {
        _usuarios.Setup(r => r.ObterPorIdAsync(_usuario.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Usuario?)null);

        Result<PerfilViewModel> result = await Criar().ExecuteAsync(
            new AtualizarFotoPerfilInput(FotoValida), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.NotFound);
    }
}
