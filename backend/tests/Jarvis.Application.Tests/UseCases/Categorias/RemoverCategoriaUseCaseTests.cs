using FluentAssertions;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.UseCases.Categorias;
using Jarvis.Core.Entities;
using Jarvis.Core.Exceptions;
using Jarvis.Core.Interfaces.Repositories;
using Moq;

namespace Jarvis.Application.Tests.UseCases.Categorias;

public class RemoverCategoriaUseCaseTests
{
    private readonly Mock<ICategoriaRepository> _repo = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Guid _usuarioId = Guid.NewGuid();

    public RemoverCategoriaUseCaseTests()
    {
        _usuarioLogado.SetupGet(u => u.Id).Returns(_usuarioId);
    }

    private RemoverCategoriaUseCase Criar() => new(_repo.Object, _usuarioLogado.Object);

    [Fact]
    public async Task Remove_quando_nao_tem_tarefa_pendente()
    {
        Categoria categoria = new(_usuarioId, "Trabalho");
        _repo.Setup(r => r.ObterPorId(categoria.Id, _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(categoria);
        _repo.Setup(r => r.TemTarefaPendente(categoria.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        await Criar().Executar(categoria.Id);

        _repo.Verify(r => r.Remover(categoria, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Lanca_404_quando_categoria_nao_existe()
    {
        _repo.Setup(r => r.ObterPorId(It.IsAny<Guid>(), _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Categoria?)null);

        Func<Task> act = () => Criar().Executar(Guid.NewGuid());

        (await act.Should().ThrowAsync<ApplicationLayerException>())
            .Which.StatusCode.Should().Be(404);
    }

    [Fact]
    public async Task Lanca_409_quando_tem_tarefa_pendente()
    {
        Categoria categoria = new(_usuarioId, "Trabalho");
        _repo.Setup(r => r.ObterPorId(categoria.Id, _usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(categoria);
        _repo.Setup(r => r.TemTarefaPendente(categoria.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        Func<Task> act = () => Criar().Executar(categoria.Id);

        (await act.Should().ThrowAsync<ApplicationLayerException>())
            .Which.StatusCode.Should().Be(409);

        _repo.Verify(r => r.Remover(It.IsAny<Categoria>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
