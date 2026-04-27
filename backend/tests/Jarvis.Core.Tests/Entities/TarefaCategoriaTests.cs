using FluentAssertions;
using Jarvis.Core.Entities;

namespace Jarvis.Core.Tests.Entities;

public class TarefaCategoriaTests
{
    [Fact]
    public void Ctor_define_ids()
    {
        Guid tarefaId = Guid.NewGuid();
        Guid categoriaId = Guid.NewGuid();

        TarefaCategoria tc = new(tarefaId, categoriaId);

        tc.TarefaId.Should().Be(tarefaId);
        tc.CategoriaId.Should().Be(categoriaId);
    }
}
