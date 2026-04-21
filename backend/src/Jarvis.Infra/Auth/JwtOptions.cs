namespace Jarvis.Infra.Auth;

public class JwtOptions
{
    public string Issuer { get; set; } = null!;
    public string Audience { get; set; } = null!;
    public string Secret { get; set; } = null!;
    public int ExpirationHours { get; set; } = 24;
}
