using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FluentAssertions;
using Jarvis.Api.Auth;
using Microsoft.AspNetCore.Http;

namespace Jarvis.Api.Tests.Auth;

public class UsuarioLogadoContextTests
{
    private static UsuarioLogadoContext Criar(HttpContext? ctx)
    {
        FakeHttpContextAccessor accessor = new() { HttpContext = ctx };
        return new UsuarioLogadoContext(accessor);
    }

    private static HttpContext ComClaims(params Claim[] claims)
    {
        DefaultHttpContext ctx = new();
        ClaimsIdentity identity = new(claims, authenticationType: "Test");
        ctx.User = new ClaimsPrincipal(identity);
        return ctx;
    }

    [Fact]
    public void Id_le_claim_Sub_quando_presente()
    {
        Guid id = Guid.NewGuid();
        HttpContext ctx = ComClaims(new Claim(JwtRegisteredClaimNames.Sub, id.ToString()));

        Criar(ctx).Id.Should().Be(id);
    }

    [Fact]
    public void Id_cai_pra_NameIdentifier_quando_Sub_ausente()
    {
        Guid id = Guid.NewGuid();
        HttpContext ctx = ComClaims(new Claim(ClaimTypes.NameIdentifier, id.ToString()));

        Criar(ctx).Id.Should().Be(id);
    }

    [Fact]
    public void Id_retorna_Empty_quando_sem_claim()
    {
        HttpContext ctx = ComClaims();
        Criar(ctx).Id.Should().Be(Guid.Empty);
    }

    [Fact]
    public void Id_retorna_Empty_quando_claim_nao_e_guid()
    {
        HttpContext ctx = ComClaims(new Claim(JwtRegisteredClaimNames.Sub, "abc"));
        Criar(ctx).Id.Should().Be(Guid.Empty);
    }

    [Fact]
    public void Id_retorna_Empty_quando_HttpContext_null()
    {
        Criar(null).Id.Should().Be(Guid.Empty);
    }

    [Fact]
    public void Email_le_claim_Email_jwt()
    {
        HttpContext ctx = ComClaims(new Claim(JwtRegisteredClaimNames.Email, "p@e.com"));
        Criar(ctx).Email.Should().Be("p@e.com");
    }

    [Fact]
    public void Email_cai_pra_ClaimTypes_Email_quando_jwt_ausente()
    {
        HttpContext ctx = ComClaims(new Claim(ClaimTypes.Email, "p@e.com"));
        Criar(ctx).Email.Should().Be("p@e.com");
    }

    [Fact]
    public void Email_vazio_quando_sem_claim()
    {
        HttpContext ctx = ComClaims();
        Criar(ctx).Email.Should().BeEmpty();
    }

    [Fact]
    public void EstaAutenticado_true_com_identity_autenticada()
    {
        HttpContext ctx = ComClaims(new Claim(JwtRegisteredClaimNames.Sub, Guid.NewGuid().ToString()));
        Criar(ctx).EstaAutenticado.Should().BeTrue();
    }

    [Fact]
    public void EstaAutenticado_false_quando_identity_anonima()
    {
        DefaultHttpContext ctx = new();
        ctx.User = new ClaimsPrincipal(new ClaimsIdentity());
        Criar(ctx).EstaAutenticado.Should().BeFalse();
    }

    [Fact]
    public void EstaAutenticado_false_quando_HttpContext_null()
    {
        Criar(null).EstaAutenticado.Should().BeFalse();
    }

    private sealed class FakeHttpContextAccessor : IHttpContextAccessor
    {
        public HttpContext? HttpContext { get; set; }
    }
}
