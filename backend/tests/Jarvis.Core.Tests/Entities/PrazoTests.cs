using FluentAssertions;
using Jarvis.Core.Common;
using Jarvis.Core.Entities;

namespace Jarvis.Core.Tests.Entities;

public class PrazoTests
{
    private static readonly Guid UsuarioId = Guid.NewGuid();

    [Fact]
    public void Criar_define_campos_e_trima_nome()
    {
        Result<Prazo> r = Prazo.Criar(UsuarioId, "  Hoje  ", 0);

        r.IsSuccess.Should().BeTrue();
        Prazo p = r.Value!;
        p.Id.Should().NotBe(Guid.Empty);
        p.UsuarioId.Should().Be(UsuarioId);
        p.Nome.Should().Be("Hoje");
        p.DuracaoDias.Should().Be(0);
    }

    [Fact]
    public void Criar_aceita_duracao_null_pra_sem_prazo()
    {
        Prazo p = Prazo.Criar(UsuarioId, "Sem prazo", null).Value!;
        p.DuracaoDias.Should().BeNull();
    }

    [Fact]
    public void Criar_falha_quando_usuario_vazio()
    {
        Result<Prazo> r = Prazo.Criar(Guid.Empty, "x", 1);
        r.IsFailure.Should().BeTrue();
        r.Error!.Code.Should().Be("prazo.usuario-obrigatorio");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Criar_falha_quando_nome_vazio(string? nome)
    {
        Result<Prazo> r = Prazo.Criar(UsuarioId, nome!, 1);
        r.IsFailure.Should().BeTrue();
        r.Error!.Code.Should().Be("prazo.nome-obrigatorio");
    }

    [Fact]
    public void Criar_falha_quando_nome_passa_de_50_chars()
    {
        string nome = new('a', 51);
        Result<Prazo> r = Prazo.Criar(UsuarioId, nome, 1);
        r.IsFailure.Should().BeTrue();
        r.Error!.Code.Should().Be("prazo.nome-muito-longo");
    }

    [Fact]
    public void Criar_falha_quando_duracao_negativa()
    {
        Result<Prazo> r = Prazo.Criar(UsuarioId, "x", -1);
        r.IsFailure.Should().BeTrue();
        r.Error!.Code.Should().Be("prazo.duracao-negativa");
    }

    [Fact]
    public void ResolverDataPrazo_retorna_null_quando_sem_duracao()
    {
        Prazo p = Prazo.Criar(UsuarioId, "Sem prazo", null).Value!;
        p.ResolverDataPrazo(DateTime.UtcNow).Should().BeNull();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(7)]
    [InlineData(30)]
    public void ResolverDataPrazo_soma_dias_a_data_referencia(int dias)
    {
        Prazo p = Prazo.Criar(UsuarioId, "x", dias).Value!;
        DateTime referencia = new(2026, 4, 27, 14, 30, 0);

        DateTime? resultado = p.ResolverDataPrazo(referencia);

        resultado.Should().Be(new DateTime(2026, 4, 27).AddDays(dias));
    }

    [Fact]
    public void ResolverDataPrazo_normaliza_referencia_pra_data()
    {
        Prazo p = Prazo.Criar(UsuarioId, "x", 0).Value!;
        DateTime referencia = new(2026, 4, 27, 23, 59, 59);

        p.ResolverDataPrazo(referencia).Should().Be(new DateTime(2026, 4, 27));
    }

    [Fact]
    public void Atualizar_modifica_e_revalida()
    {
        Prazo p = Prazo.Criar(UsuarioId, "Hoje", 0).Value!;

        Result r = p.Atualizar("  Amanha  ", 1);

        r.IsSuccess.Should().BeTrue();
        p.Nome.Should().Be("Amanha");
        p.DuracaoDias.Should().Be(1);
    }

    [Fact]
    public void Atualizar_falha_quando_nome_invalido()
    {
        Prazo p = Prazo.Criar(UsuarioId, "Hoje", 0).Value!;
        Result r = p.Atualizar("", 1);
        r.IsFailure.Should().BeTrue();
        r.Error!.Code.Should().Be("prazo.nome-obrigatorio");
    }

    [Fact]
    public void Atualizar_falha_quando_duracao_negativa()
    {
        Prazo p = Prazo.Criar(UsuarioId, "Hoje", 0).Value!;
        Result r = p.Atualizar("x", -5);
        r.IsFailure.Should().BeTrue();
        r.Error!.Code.Should().Be("prazo.duracao-negativa");
    }
}
