using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Jarvis.Application.InputModels.Categorias;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ReadRepositories;
using Jarvis.Application.UseCases.Categorias;
using Jarvis.Application.ViewModels.Categorias;
using Jarvis.Core.Common;
using Jarvis.Core.Entities;
using Jarvis.Core.Interfaces.Repositories;
using Moq;

namespace Jarvis.Application.Tests.UseCases.Categorias;

public class CriarCategoriaUseCaseTests
{
    private readonly Mock<ICategoriaRepository> _repo = new();
    private readonly Mock<ICategoriaReadRepository> _readRepo = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Mock<IValidator<CriarCategoriaInput>> _validator = new();
    private readonly Guid _usuarioId = Guid.NewGuid();

    public CriarCategoriaUseCaseTests()
    {
        _usuarioLogado.SetupGet(u => u.Id).Returns(_usuarioId);
        _validator.Setup(v => v.ValidateAsync(It.IsAny<CriarCategoriaInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());
    }

    private CriarCategoriaUseCase Criar()
        => new(_repo.Object, _readRepo.Object, _usuarioLogado.Object, _validator.Object);

    [Fact]
    public async Task Cria_categoria_quando_nome_nao_existe()
    {
        _readRepo.Setup(r => r.ExisteNomeAsync(_usuarioId, "Trabalho", It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _repo.Setup(r => r.AdicionarAsync(It.IsAny<Categoria>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Categoria c, CancellationToken _) => c);

        Result<CategoriaViewModel> result = await Criar().ExecuteAsync(new CriarCategoriaInput("Trabalho"), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Nome.Should().Be("Trabalho");
    }

    [Fact]
    public async Task Retorna_conflict_quando_nome_ja_existe()
    {
        _readRepo.Setup(r => r.ExisteNomeAsync(_usuarioId, It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        Result<CategoriaViewModel> result = await Criar().ExecuteAsync(new CriarCategoriaInput("Trabalho"), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Code.Should().Be("categoria.nome-ja-existe");
        result.Error.Type.Should().Be(ErrorType.Conflict);
    }
}
