using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Liriun.Application.InputModels.Categorias;
using Liriun.Application.Interfaces.Auth;
using Liriun.Application.ReadRepositories;
using Liriun.Application.UseCases.Categorias;
using Liriun.Application.ViewModels.Categorias;
using Liriun.Core.Common;
using Liriun.Core.Entities;
using Liriun.Core.Interfaces.Repositories;
using Moq;

namespace Liriun.Application.Tests.UseCases.Categorias;

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
