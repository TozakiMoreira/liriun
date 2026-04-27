using FluentAssertions;
using Jarvis.Core.Common;
using Jarvis.Core.Entities;

namespace Jarvis.Core.Tests.Entities;

public class UsuarioTests
{
    [Fact]
    public void Criar_normaliza_email_pra_lowercase_e_trim_e_trima_nome()
    {
        Result<Usuario> r = Usuario.Criar("  Pedro  ", "  Pedro@Exemplo.COM  ", "hash");

        r.IsSuccess.Should().BeTrue();
        Usuario u = r.Value!;
        u.Id.Should().NotBe(Guid.Empty);
        u.Nome.Should().Be("Pedro");
        u.Email.Should().Be("pedro@exemplo.com");
        u.SenhaHash.Should().Be("hash");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Criar_falha_quando_nome_vazio(string? nome)
    {
        Result<Usuario> r = Usuario.Criar(nome!, "p@e.com", "hash");
        r.IsFailure.Should().BeTrue();
        r.Error!.Code.Should().Be("usuario.nome-obrigatorio");
    }

    [Fact]
    public void Criar_falha_quando_nome_passa_de_100_chars()
    {
        string nome = new('a', 101);
        Result<Usuario> r = Usuario.Criar(nome, "p@e.com", "hash");
        r.IsFailure.Should().BeTrue();
        r.Error!.Code.Should().Be("usuario.nome-muito-longo");
    }

    [Theory]
    [InlineData("sem-arroba.com")]
    [InlineData("sem-ponto@local")]
    public void Criar_falha_quando_email_invalido(string email)
    {
        Result<Usuario> r = Usuario.Criar("Pedro", email, "hash");
        r.IsFailure.Should().BeTrue();
        r.Error!.Code.Should().Be("usuario.email-invalido");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Criar_falha_quando_email_vazio(string? email)
    {
        Result<Usuario> r = Usuario.Criar("Pedro", email!, "hash");
        r.IsFailure.Should().BeTrue();
        r.Error!.Code.Should().Be("usuario.email-obrigatorio");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Criar_falha_quando_senha_vazia(string? hash)
    {
        Result<Usuario> r = Usuario.Criar("Pedro", "p@e.com", hash!);
        r.IsFailure.Should().BeTrue();
        r.Error!.Code.Should().Be("usuario.senha-obrigatoria");
    }

    [Fact]
    public void AtualizarNome_atualiza_e_revalida()
    {
        Usuario u = Usuario.Criar("Pedro", "p@e.com", "hash").Value!;
        Result r = u.AtualizarNome("Pedro Tozaki");
        r.IsSuccess.Should().BeTrue();
        u.Nome.Should().Be("Pedro Tozaki");
    }

    [Fact]
    public void AtualizarNome_falha_quando_invalido()
    {
        Usuario u = Usuario.Criar("Pedro", "p@e.com", "hash").Value!;
        Result r = u.AtualizarNome("");
        r.IsFailure.Should().BeTrue();
        r.Error!.Code.Should().Be("usuario.nome-obrigatorio");
    }
}
