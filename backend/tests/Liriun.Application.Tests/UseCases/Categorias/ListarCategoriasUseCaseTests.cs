using FluentAssertions;
using Liriun.Application.Interfaces.Auth;
using Liriun.Application.ReadModels;
using Liriun.Application.ReadRepositories;
using Liriun.Application.UseCases.Categorias;
using Liriun.Application.ViewModels.Categorias;
using Liriun.Core.Common;
using Moq;

namespace Liriun.Application.Tests.UseCases.Categorias;

public class ListarCategoriasUseCaseTests
{
    private readonly Mock<ICategoriaReadRepository> _readRepo = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Guid _usuarioId = Guid.NewGuid();

    public ListarCategoriasUseCaseTests()
    {
        _usuarioLogado.SetupGet(u => u.Id).Returns(_usuarioId);
    }

    [Fact]
    public async Task Retorna_categorias_do_usuario_logado()
    {
        CategoriaReadModel c1 = new(Guid.NewGuid(), "Casa", DateTime.UtcNow);
        CategoriaReadModel c2 = new(Guid.NewGuid(), "Trabalho", DateTime.UtcNow);
        _readRepo.Setup(r => r.ListarPorUsuarioAsync(_usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new[] { c1, c2 });

        ListarCategoriasUseCase useCase = new(_readRepo.Object, _usuarioLogado.Object);
        Result<IReadOnlyList<CategoriaViewModel>> result = await useCase.ExecuteAsync(CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Should().HaveCount(2);
        result.Value.Select(c => c.Nome).Should().Contain(new[] { "Casa", "Trabalho" });
    }
}
