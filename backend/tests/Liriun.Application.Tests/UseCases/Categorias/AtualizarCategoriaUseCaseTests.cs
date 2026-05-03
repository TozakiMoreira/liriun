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

public class AtualizarCategoriaUseCaseTests
{
    private readonly Mock<ICategoriaRepository> _repo = new();
    private readonly Mock<ICategoriaReadRepository> _readRepo = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Mock<IValidator<AtualizarCategoriaInput>> _validator = new();
    private readonly Guid _usuarioId = Guid.NewGuid();

    public AtualizarCategoriaUseCaseTests()
    {
        _usuarioLogado.SetupGet(u => u.Id).Returns(_usuarioId);
        _validator.Setup(v => v.ValidateAsync(It.IsAny<AtualizarCategoriaInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());
    }

    private AtualizarCategoriaUseCase Criar()
        => new(_repo.Object, _readRepo.Object, _usuarioLogado.Object, _validator.Object);

    [Fact]
    public async Task Renomeia_quando_nome_disponivel()
    {
        Categoria categoria = Categoria.Criar(_usuarioId, "Trabalho").Value!;
        _repo.Setup(r => r.ObterPorIdAsync(categoria.Id, _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(categoria);
        _readRepo.Setup(r => r.ExisteOutraComNomeAsync(_usuarioId, "Faculdade", categoria.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _repo.Setup(r => r.AtualizarAsync(It.IsAny<Categoria>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Categoria c, CancellationToken _) => c);

        Result<CategoriaViewModel> result = await Criar().ExecuteAsync(
            categoria.Id, new AtualizarCategoriaInput("Faculdade"), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Nome.Should().Be("Faculdade");
    }

    [Fact]
    public async Task Retorna_not_found_quando_categoria_nao_existe()
    {
        _repo.Setup(r => r.ObterPorIdAsync(It.IsAny<Guid>(), _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Categoria?)null);

        Result<CategoriaViewModel> result = await Criar().ExecuteAsync(
            Guid.NewGuid(), new AtualizarCategoriaInput("Qualquer"), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Code.Should().Be("categoria.nao-encontrada");
        result.Error.Type.Should().Be(ErrorType.NotFound);
    }

    [Fact]
    public async Task Retorna_conflict_quando_outra_categoria_ja_tem_o_nome()
    {
        Categoria categoria = Categoria.Criar(_usuarioId, "Trabalho").Value!;
        _repo.Setup(r => r.ObterPorIdAsync(categoria.Id, _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(categoria);
        _readRepo.Setup(r => r.ExisteOutraComNomeAsync(_usuarioId, "Casa", categoria.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        Result<CategoriaViewModel> result = await Criar().ExecuteAsync(
            categoria.Id, new AtualizarCategoriaInput("Casa"), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.Conflict);
    }
}
