using FluentValidation;
using FluentValidation.Results;
using Liriun.Application.InputModels.Tarefas;
using Liriun.Application.Interfaces.Auth;
using Liriun.Application.ReadRepositories;
using Liriun.Application.ViewModels.Tarefas;
using Liriun.Core.Common;
using Liriun.Core.Entities;
using Liriun.Core.Errors;
using Liriun.Core.Interfaces.Repositories;

namespace Liriun.Application.UseCases.Tarefas;

public class CriarTarefaUseCase
{
    private readonly ITarefaRepository _tarefas;
    private readonly ICategoriaReadRepository _categoriaRead;
    private readonly IUsuarioLogado _usuarioLogado;
    private readonly IValidator<CriarTarefaInput> _validator;

    public CriarTarefaUseCase(
        ITarefaRepository tarefas,
        ICategoriaReadRepository categoriaRead,
        IUsuarioLogado usuarioLogado,
        IValidator<CriarTarefaInput> validator)
    {
        _tarefas = tarefas;
        _categoriaRead = categoriaRead;
        _usuarioLogado = usuarioLogado;
        _validator = validator;
    }

    public async Task<Result<TarefaViewModel>> ExecuteAsync(CriarTarefaInput input, CancellationToken ct)
    {
        ValidationResult validation = await _validator.ValidateAsync(input, ct);
        if (!validation.IsValid)
        {
            Dictionary<string, string[]> details = validation.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return Result<TarefaViewModel>.Failure(
                Error.Validation("tarefa.validacao", "Dados invalidos", details));
        }

        IReadOnlyList<Guid> categoriaIds = input.CategoriaIds?.Distinct().ToList() ?? [];

        if (categoriaIds.Count > 0 &&
            !await _categoriaRead.TodasPertencemAoUsuarioAsync(categoriaIds, _usuarioLogado.Id, ct))
        {
            return Result<TarefaViewModel>.Failure(TarefaErrors.CategoriasInvalidas());
        }

        Result<Tarefa> criacaoResult = Tarefa.Criar(
            _usuarioLogado.Id,
            input.Nome,
            input.Prioridade,
            input.DataPrazo,
            input.HorarioFinal,
            input.Observacoes,
            input.Recorrencia,
            input.RecorrenciaQuantidade);

        if (criacaoResult.IsFailure)
            return Result<TarefaViewModel>.Failure(criacaoResult.Error!);

        Tarefa tarefa = await _tarefas.AdicionarAsync(criacaoResult.Value!, categoriaIds, ct);

        // Gera ocorrências futuras upfront se recorrência > 1.
        IReadOnlyList<Tarefa> futuras = criacaoResult.Value!.GerarOcorrenciasFuturas();
        foreach (Tarefa futura in futuras)
        {
            await _tarefas.AdicionarAsync(futura, categoriaIds, ct);
        }

        return Result<TarefaViewModel>.Success(TarefaViewModel.FromEntity(tarefa, DateTime.UtcNow));
    }
}
