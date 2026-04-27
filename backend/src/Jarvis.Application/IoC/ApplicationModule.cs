using FluentValidation;
using Jarvis.Application.UseCases.Auth;
using Jarvis.Application.UseCases.Categorias;
using Jarvis.Application.UseCases.Prazos;
using Jarvis.Application.UseCases.Tarefas;
using Microsoft.Extensions.DependencyInjection;

namespace Jarvis.Application.IoC;

public static class ApplicationModule
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<CadastrarUsuarioUseCase>(ServiceLifetime.Scoped);

        services.AddScoped<CadastrarUsuarioUseCase>();
        services.AddScoped<LoginUseCase>();

        services.AddScoped<ListarCategoriasUseCase>();
        services.AddScoped<CriarCategoriaUseCase>();
        services.AddScoped<AtualizarCategoriaUseCase>();
        services.AddScoped<RemoverCategoriaUseCase>();

        services.AddScoped<ListarPrazosUseCase>();
        services.AddScoped<CriarPrazoUseCase>();
        services.AddScoped<AtualizarPrazoUseCase>();
        services.AddScoped<RemoverPrazoUseCase>();

        services.AddScoped<ListarTarefasPendentesUseCase>();
        services.AddScoped<ListarTarefasConcluidasUseCase>();
        services.AddScoped<CriarTarefaUseCase>();
        services.AddScoped<AtualizarTarefaUseCase>();
        services.AddScoped<ConcluirTarefaUseCase>();
        services.AddScoped<RemoverTarefaUseCase>();

        return services;
    }
}
