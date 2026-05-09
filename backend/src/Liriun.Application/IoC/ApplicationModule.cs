using FluentValidation;
using Liriun.Application.UseCases.Auth;
using Liriun.Application.UseCases.Categorias;
using Liriun.Application.UseCases.Ia;
using Liriun.Application.UseCases.Lancamentos;
using Liriun.Application.UseCases.Tarefas;
using Microsoft.Extensions.DependencyInjection;

namespace Liriun.Application.IoC;

public static class ApplicationModule
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<CadastrarUsuarioUseCase>(ServiceLifetime.Scoped);

        services.AddScoped<CadastrarUsuarioUseCase>();
        services.AddScoped<LoginUseCase>();
        services.AddScoped<ObterPerfilUseCase>();
        services.AddScoped<EsqueciSenhaUseCase>();
        services.AddScoped<AlterarSenhaUseCase>();
        services.AddScoped<AtualizarPerfilUseCase>();
        services.AddScoped<AtualizarFotoPerfilUseCase>();
        services.AddScoped<ExcluirContaUseCase>();

        services.AddScoped<ListarCategoriasUseCase>();
        services.AddScoped<CriarCategoriaUseCase>();
        services.AddScoped<AtualizarCategoriaUseCase>();
        services.AddScoped<RemoverCategoriaUseCase>();

        services.AddScoped<ListarTarefasPendentesUseCase>();
        services.AddScoped<ListarTarefasConcluidasUseCase>();
        services.AddScoped<CriarTarefaUseCase>();
        services.AddScoped<AtualizarTarefaUseCase>();
        services.AddScoped<ConcluirTarefaUseCase>();
        services.AddScoped<ReabrirTarefaUseCase>();
        services.AddScoped<RemoverTarefaUseCase>();

        services.AddScoped<ConversarCapturaUseCase>();

        services.AddScoped<ListarLancamentosUseCase>();
        services.AddScoped<CriarLancamentoUseCase>();
        services.AddScoped<AtualizarLancamentoUseCase>();
        services.AddScoped<RemoverLancamentoUseCase>();
        services.AddScoped<MarcarPagoUseCase>();
        services.AddScoped<DesfazerPagamentoUseCase>();
        services.AddScoped<ObterBalancoUseCase>();
        services.AddScoped<ObterAnexoUseCase>();

        return services;
    }
}
