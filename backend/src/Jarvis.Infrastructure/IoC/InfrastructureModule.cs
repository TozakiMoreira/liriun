using Jarvis.Application.Interfaces;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.Interfaces.Ia;
using Jarvis.Application.ReadRepositories;
using Jarvis.Core.Interfaces.Repositories;
using Jarvis.Infrastructure.Auth;
using Jarvis.Infrastructure.Ia;
using Jarvis.Infrastructure.Persistence;
using Jarvis.Infrastructure.ReadRepositories;
using Jarvis.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Jarvis.Infrastructure.IoC;

public static class InfrastructureModule
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        string connectionString = configuration.GetConnectionString("Jarvis")
            ?? throw new InvalidOperationException("ConnectionStrings:Jarvis nao configurada");

        services.AddDbContext<JarvisDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        services.AddScoped<ICategoriaRepository, CategoriaRepository>();
        services.AddScoped<ITarefaRepository, TarefaRepository>();

        services.AddScoped<IUsuarioReadRepository, UsuarioReadRepository>();
        services.AddScoped<ICategoriaReadRepository, CategoriaReadRepository>();
        services.AddScoped<ITarefaReadRepository, TarefaReadRepository>();

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
