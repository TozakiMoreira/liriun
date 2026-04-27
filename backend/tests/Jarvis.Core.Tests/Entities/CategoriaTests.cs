using FluentAssertions;
using Jarvis.Core.Common;
using Jarvis.Core.Entities;

namespace Jarvis.Core.Tests.Entities;

public class CategoriaTests
{
    private static readonly Guid UsuarioId = Guid.NewGuid();

    [Fact]
    public void Criar_define_campos_e_trima_nome()
    {
        Result<Categoria> r = Categoria.Criar(UsuarioId, "  Trabalho  ");

        r.IsSuccess.Should().BeTrue();
        Categoria c = r.Value!;
        c.Id.Should().NotBe(Guid.Empty);
        c.UsuarioId.Should().Be(UsuarioId);
        c.Nome.Should().Be("Trabalho");
        c.Tarefas.Should().BeEmpty();
    }

    [Fact]
    public void Criar_falha_quando_usuario_vazio()
    {
        Result<Categoria> r = Categoria.Criar(Guid.Empty, "x");
        r.IsFailure.Should().BeTrue();
        r.Error!.Code.Should().Be("categoria.usuario-obrigatorio");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Criar_falha_quando_nome_vazio(string? nome)
    {
        Result<Categoria> r = Categoria.Criar(UsuarioId, nome!);
        r.IsFailure.Should().BeTrue();
        r.Error!.Code.Should().Be("categoria.nome-obrigatorio");
    }

    [Fact]
    public void Criar_falha_quando_nome_passa_de_50_chars()
    {
        string nome = new('a', 51);
        Result<Categoria> r = Categoria.Criar(UsuarioId, nome);
        r.IsFailure.Should().BeTrue();
        r.Error!.Code.Should().Be("categoria.nome-muito-longo");
    }

    [Fact]
    public void Renomear_atualiza_e_trima()
    {
        Categoria c = Categoria.Criar(UsuarioId, "Trabalho").Value!;

        Result r = c.Renomear("  Faculdade  ");

        r.IsSuccess.Should().BeTrue();
        c.Nome.Should().Be("Faculdade");
    }

    [Fact]
    public void Renomear_falha_quando_nome_invalido()
    {
        Categoria c = Categoria.Criar(UsuarioId, "Trabalho").Value!;
        Result r = c.Renomear("");
        r.IsFailure.Should().BeTrue();
        r.Error!.Code.Should().Be("categoria.nome-obrigatorio");
    }
}
