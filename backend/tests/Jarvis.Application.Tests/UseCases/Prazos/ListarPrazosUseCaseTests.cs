using FluentAssertions;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.UseCases.Prazos;
using Jarvis.Application.ViewModels.Prazos;
using Jarvis.Core.Entities;
using Jarvis.Core.Interfaces.Repositories;
using Moq;

namespace Jarvis.Application.Tests.UseCases.Prazos;

public class ListarPrazosUseCaseTests
{
    private readonly Mock<IPrazoRepository> _repo = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Guid _usuarioId = Guid.NewGuid();

    public ListarPrazosUseCaseTests()
    {
        _usuarioLogado.SetupGet(u => u.Id).Returns(_usuarioId);
    }

    [Fact]
    public async Task Retorna_prazos_do_usuario_logado()
    {
        Prazo p1 = new(_usuarioId, "Hoje", 0);
        Prazo p2 = new(_usuarioId, "Sem prazo", null);
        _repo.Setup(r => r.ListarPorUsuario(_usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new[] { p1, p2 });

        ListarPrazosUseCase useCase = new(_repo.Object, _usuarioLogado.Object);
        IReadOnlyList<PrazoViewModel> result = await useCase.Executar();

        result.Should().HaveCount(2);
        result.Select(p => p.Nome).Should().Contain(new[] { "Hoje", "Sem prazo" });
    }
}
