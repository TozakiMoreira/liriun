using Jarvis.Application.Interfaces.Auth;
using Jarvis.Core.Interfaces.Repositories;
using Jarvis.Infra.Auth;
using Jarvis.Infra.Data;
using Jarvis.Infra.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Jarvis.Infra.IoC;

public static class InfrastructureModule
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Jarvis")
            ?? throw new InvalidOperationException("ConnectionStrings:Jarvis não configurada");

        services.AddDbContext<JarvisDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        services.AddScoped<ICategoriaRepository, CategoriaRepository>();
        services.AddScoped<IPrazoRepository, PrazoRepository>();
        services.AddScoped<ITarefaRepository, TarefaRepository>();

        var jwtOptions = configuration.GetSection("Jwt").Get<JwtOptions>()
            ?? throw new InvalidOperationException("Seção 'Jwt' não configurada");

        if (string.IsNullOrWhiteSpace(jwtOptions.Secret))
            throw new InvalidOperationException("Jwt:Secret não configurada");

        services.AddSingleton(jwtOptions);
        services.AddSingleton<IJwtTokenService, JwtTokenService>();
        services.AddSingleton<IPasswordHasher, BCryptPasswordHasher>();

        return services;
    }
}
