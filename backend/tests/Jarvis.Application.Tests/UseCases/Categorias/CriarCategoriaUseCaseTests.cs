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

public class CriarCategoriaUseCaseTests
{
    private readonly Mock<ICategoriaRepository> _repo = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Guid _usuarioId = Guid.NewGuid();

    public CriarCategoriaUseCaseTests()
    {
        _usuarioLogado.SetupGet(u => u.Id).Returns(_usuarioId);
    }

    private CriarCategoriaUseCase Criar() => new(_repo.Object, _usuarioLogado.Object);

    [Fact]
    public async Task Cria_categoria_quando_nome_nao_existe()
    {
        _repo.Setup(r => r.ExisteNome(_usuarioId, "Trabalho", It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        CategoriaViewModel result = await Criar().Executar(new CriarCategoriaInput("Trabalho"));

        result.Nome.Should().Be("Trabalho");
        _repo.Verify(r => r.Adicionar(It.Is<Categoria>(c => c.UsuarioId == _usuarioId && c.Nome == "Trabalho"), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Lanca_409_quando_nome_ja_existe()
    {
        _repo.Setup(r => r.ExisteNome(_usuarioId, It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        Func<Task> act = () => Criar().Executar(new CriarCategoriaInput("Trabalho"));

        (await act.Should().ThrowAsync<ApplicationLayerException>())
            .Which.StatusCode.Should().Be(409);

        _repo.Verify(r => r.Adicionar(It.IsAny<Categoria>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void InputModel_rejeita_nome_vazio(string nome)
    {
        Action act = () => new CriarCategoriaInput(nome);
        act.Should().Throw<ApplicationLayerException>();
    }

    [Fact]
    public void InputModel_rejeita_nome_maior_que_50()
    {
        Action act = () => new CriarCategoriaInput(new string('a', 51));
        act.Should().Throw<ApplicationLayerException>();
    }
}
