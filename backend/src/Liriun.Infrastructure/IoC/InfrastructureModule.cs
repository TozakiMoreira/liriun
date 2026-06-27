using Liriun.Application.Interfaces;
using Liriun.Application.Interfaces.Auth;
using Liriun.Application.Interfaces.Ia;
using Liriun.Application.ReadRepositories;
using Liriun.Core.Interfaces.Repositories;
using Liriun.Infrastructure.Auth;
using Liriun.Infrastructure.Ia;
using Liriun.Infrastructure.Persistence;
using Liriun.Infrastructure.ReadRepositories;
using Liriun.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Liriun.Infrastructure.IoC;

public static class InfrastructureModule
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        string connectionString = configuration.GetConnectionString("Liriun")
            ?? throw new InvalidOperationException("ConnectionStrings:Liriun nao configurada");

        services.AddDbContext<LiriunDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        services.AddScoped<ICategoriaRepository, CategoriaRepository>();
        services.AddScoped<ITarefaRepository, TarefaRepository>();
        services.AddScoped<ICodigoBetaRepository, CodigoBetaRepository>();

        services.AddScoped<IUsuarioReadRepository, UsuarioReadRepository>();
        services.AddScoped<ICategoriaReadRepository, CategoriaReadRepository>();
        services.AddScoped<ITarefaReadRepository, TarefaReadRepository>();
        services.AddScoped<ICodigoBetaReadRepository, CodigoBetaReadRepository>();

        JwtOptions jwtOptions = configuration.GetSection("Jwt").Get<JwtOptions>()
            ?? throw new InvalidOperationException("Secao 'Jwt' nao configurada");

        if (string.IsNullOrWhiteSpace(jwtOptions.Secret))
            throw new InvalidOperationException("Jwt:Secret nao configurada");

        services.AddSingleton(jwtOptions);
        services.AddSingleton<IJwtTokenService, JwtTokenService>();
        services.AddSingleton<IPasswordHasher, BCryptPasswordHasher>();

        // Gemini (IA)
        GeminiOptions geminiOptions = configuration.GetSection(GeminiOptions.SectionName).Get<GeminiOptions>()
            ?? new GeminiOptions();
        services.AddSingleton(geminiOptions);

        services.AddHttpClient<IGeminiService, GeminiService>(client =>
        {
            client.Timeout = TimeSpan.FromSeconds(geminiOptions.TimeoutSeconds);
        });

        return services;
    }
}
