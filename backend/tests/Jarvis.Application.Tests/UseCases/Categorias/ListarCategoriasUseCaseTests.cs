using FluentAssertions;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.UseCases.Categorias;
using Jarvis.Application.ViewModels.Categorias;
using Jarvis.Core.Entities;
using Jarvis.Core.Interfaces.Repositories;
using Moq;

namespace Jarvis.Application.Tests.UseCases.Categorias;

public class ListarCategoriasUseCaseTests
{
    private readonly Mock<ICategoriaRepository> _repo = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Guid _usuarioId = Guid.NewGuid();

    public ListarCategoriasUseCaseTests()
    {
        _usuarioLogado.SetupGet(u => u.Id).Returns(_usuarioId);
    }

    [Fact]
    public async Task Retorna_categorias_do_usuario_logado()
    {
        Categoria c1 = new(_usuarioId, "Casa");
        Categoria c2 = new(_usuarioId, "Trabalho");
        _repo.Setup(r => r.ListarPorUsuario(_usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new[] { c1, c2 });

        ListarCategoriasUseCase useCase = new(_repo.Object, _usuarioLogado.Object);
        IReadOnlyList<CategoriaViewModel> result = await useCase.Executar();

        result.Should().HaveCount(2);
        result.Select(c => c.Nome).Should().Contain(new[] { "Casa", "Trabalho" });
    }
}
