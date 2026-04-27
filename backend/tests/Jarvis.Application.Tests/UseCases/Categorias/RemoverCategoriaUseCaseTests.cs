using FluentAssertions;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ReadRepositories;
using Jarvis.Application.UseCases.Categorias;
using Jarvis.Core.Common;
using Jarvis.Core.Entities;
using Jarvis.Core.Interfaces.Repositories;
using Moq;

namespace Jarvis.Application.Tests.UseCases.Categorias;

public class RemoverCategoriaUseCaseTests
{
    private readonly Mock<ICategoriaRepository> _repo = new();
    private readonly Mock<ICategoriaReadRepository> _readRepo = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Guid _usuarioId = Guid.NewGuid();

    public RemoverCategoriaUseCaseTests()
    {
        _usuarioLogado.SetupGet(u => u.Id).Returns(_usuarioId);
    }

    private RemoverCategoriaUseCase Criar() => new(_repo.Object, _readRepo.Object, _usuarioLogado.Object);

    [Fact]
    public async Task Remove_quando_nao_tem_tarefa_pendente()
    {
        Categoria categoria = Categoria.Criar(_usuarioId, "Trabalho").Value!;
        _repo.Setup(r => r.ObterPorIdAsync(categoria.Id, _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(categoria);
        _readRepo.Setup(r => r.TemTarefaPendenteAsync(categoria.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        Result result = await Criar().ExecuteAsync(categoria.Id, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        _repo.Verify(r => r.RemoverAsync(categoria, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Retorna_not_found_quando_categoria_nao_existe()
    {
        _repo.Setup(r => r.ObterPorIdAsync(It.IsAny<Guid>(), _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Categoria?)null);

        Result result = await Criar().ExecuteAsync(Guid.NewGuid(), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.NotFound);
    }

    [Fact]
    public async Task Retorna_conflict_quando_tem_tarefa_pendente()
    {
        Categoria categoria = Categoria.Criar(_usuarioId, "Trabalho").Value!;
        _repo.Setup(r => r.ObterPorIdAsync(categoria.Id, _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(categoria);
        _readRepo.Setup(r => r.TemTarefaPendenteAsync(categoria.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        Result result = await Criar().ExecuteAsync(categoria.Id, CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.Conflict);
        _repo.Verify(r => r.RemoverAsync(It.IsAny<Categoria>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
