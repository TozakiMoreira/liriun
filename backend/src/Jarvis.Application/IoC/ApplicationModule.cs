using Jarvis.Application.UseCases.Auth;
using Microsoft.Extensions.DependencyInjection;

namespace Jarvis.Application.IoC;

public static class ApplicationModule
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<CadastrarUsuarioUseCase>();
        services.AddScoped<LoginUseCase>();

        return services;
    }
}
