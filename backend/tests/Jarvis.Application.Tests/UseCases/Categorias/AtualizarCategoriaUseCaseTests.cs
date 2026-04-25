using FluentAssertions;
using Jarvis.Application.InputModels.Categorias;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.UseCases.Categorias;
using Jarvis.Application.ViewModels.Categorias;
using Jarvis.Core.Entities;
using Jarvis.Core.Exceptions;
using Jarvis.Core.Interfaces.Repositories;
using Moq;

namespace Jarvis.Application.Tests.UseCases.Categorias;

public class AtualizarCategoriaUseCaseTests
{
    private readonly Mock<ICategoriaRepository> _repo = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Guid _usuarioId = Guid.NewGuid();

    public AtualizarCategoriaUseCaseTests()
    {
        _usuarioLogado.SetupGet(u => u.Id).Returns(_usuarioId);
    }

    private AtualizarCategoriaUseCase Criar() => new(_repo.Object, _usuarioLogado.Object);

    private Categoria CriarCategoria(string nome = "Trabalho")
    {
        return new Categoria(_usuarioId, nome);
    }

    [Fact]
    public async Task Renomeia_quando_nome_disponivel()
    {
        Categoria categoria = CriarCategoria("Trabalho");
        _repo.Setup(r => r.ObterPorId(categoria.Id, _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(categoria);
        _repo.Setup(r => r.ExisteOutraComNome(_usuarioId, "Faculdade", categoria.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        CategoriaViewModel result = await Criar().Executar(categoria.Id, new AtualizarCategoriaInput("Faculdade"));

        result.Nome.Should().Be("Faculdade");
        _repo.Verify(r => r.Atualizar(It.Is<Categoria>(c => c.Nome == "Faculdade"), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Lanca_404_quando_categoria_nao_existe()
    {
        _repo.Setup(r => r.ObterPorId(It.IsAny<Guid>(), _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Categoria?)null);

        Func<Task> act = () => Criar().Executar(Guid.NewGuid(), new AtualizarCategoriaInput("Qualquer"));

        (await act.Should().ThrowAsync<ApplicationLayerException>())
            .Which.StatusCode.Should().Be(404);
    }

    [Fact]
    public async Task Lanca_409_quando_outra_categoria_ja_tem_o_nome()
    {
        Categoria categoria = CriarCategoria("Trabalho");
        _repo.Setup(r => r.ObterPorId(categoria.Id, _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(categoria);
        _repo.Setup(r => r.ExisteOutraComNome(_usuarioId, "Casa", categoria.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        Func<Task> act = () => Criar().Executar(categoria.Id, new AtualizarCategoriaInput("Casa"));

        (await act.Should().ThrowAsync<ApplicationLayerException>())
            .Which.StatusCode.Should().Be(409);

        _repo.Verify(r => r.Atualizar(It.IsAny<Categoria>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Renomear_pra_mesmo_nome_case_diferente_nao_e_bloqueado_pelo_use_case()
    {
        Categoria categoria = CriarCategoria("Trabalho");
        _repo.Setup(r => r.ObterPorId(categoria.Id, _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(categoria);
        _repo.Setup(r => r.ExisteOutraComNome(_usuarioId, "trabalho", categoria.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        CategoriaViewModel result = await Criar().Executar(categoria.Id, new AtualizarCategoriaInput("trabalho"));

        result.Nome.Should().Be("trabalho");
    }
}
