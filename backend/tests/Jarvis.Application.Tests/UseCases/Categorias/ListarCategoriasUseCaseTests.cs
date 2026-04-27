using FluentAssertions;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ReadModels;
using Jarvis.Application.ReadRepositories;
using Jarvis.Application.UseCases.Categorias;
using Jarvis.Application.ViewModels.Categorias;
using Jarvis.Core.Common;
using Moq;

namespace Jarvis.Application.Tests.UseCases.Categorias;

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
