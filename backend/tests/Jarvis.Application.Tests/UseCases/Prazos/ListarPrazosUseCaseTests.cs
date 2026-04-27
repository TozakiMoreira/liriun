using FluentAssertions;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ReadModels;
using Jarvis.Application.ReadRepositories;
using Jarvis.Application.UseCases.Prazos;
using Jarvis.Application.ViewModels.Prazos;
using Jarvis.Core.Common;
using Moq;

namespace Jarvis.Application.Tests.UseCases.Prazos;

public class ListarPrazosUseCaseTests
{
    private readonly Mock<IPrazoReadRepository> _readRepo = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Guid _usuarioId = Guid.NewGuid();

    public ListarPrazosUseCaseTests()
    {
        _usuarioLogado.SetupGet(u => u.Id).Returns(_usuarioId);
    }

    [Fact]
    public async Task Retorna_prazos_do_usuario_logado()
    {
        PrazoReadModel p1 = new(Guid.NewGuid(), "Hoje", 0, DateTime.UtcNow);
        PrazoReadModel p2 = new(Guid.NewGuid(), "Sem prazo", null, DateTime.UtcNow);
        _readRepo.Setup(r => r.ListarPorUsuarioAsync(_usuarioId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new[] { p1, p2 });

        ListarPrazosUseCase useCase = new(_readRepo.Object, _usuarioLogado.Object);
        Result<IReadOnlyList<PrazoViewModel>> result = await useCase.ExecuteAsync(CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Should().HaveCount(2);
        result.Value.Select(p => p.Nome).Should().Contain(new[] { "Hoje", "Sem prazo" });
    }
}
