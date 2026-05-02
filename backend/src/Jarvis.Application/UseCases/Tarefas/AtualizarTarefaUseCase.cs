using FluentValidation;
using FluentValidation.Results;
using Jarvis.Application.InputModels.Tarefas;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ReadRepositories;
using Jarvis.Application.ViewModels.Tarefas;
using Jarvis.Core.Common;
using Jarvis.Core.Entities;
using Jarvis.Core.Errors;
using Jarvis.Core.Interfaces.Repositories;

namespace Jarvis.Application.UseCases.Tarefas;

public class AtualizarTarefaUseCase
{
    private readonly ITarefaRepository _tarefas;
    private readonly ICategoriaReadRepository _categoriaRead;
    private readonly IUsuarioLogado _usuarioLogado;
    private readonly IValidator<AtualizarTarefaInput> _validator;

    public AtualizarTarefaUseCase(
        ITarefaRepository tarefas,
        ICategoriaReadRepository categoriaRead,
        IUsuarioLogado usuarioLogado,
        IValidator<AtualizarTarefaInput> validator)
    {
        _tarefas = tarefas;
        _categoriaRead = categoriaRead;
        _usuarioLogado = usuarioLogado;
        _validator = validator;
    }

    public async Task<Result<TarefaViewModel>> ExecuteAsync(Guid id, AtualizarTarefaInput input, CancellationToken ct)
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

        Tarefa? tarefa = await _tarefas.ObterPorIdAsync(id, _usuarioLogado.Id, ct);
        if (tarefa is null)
            return Result<TarefaViewModel>.Failure(TarefaErrors.NaoEncontrada());

        IReadOnlyList<Guid> categoriaIds = input.CategoriaIds?.Distinct().ToList() ?? [];

        if (categoriaIds.Count > 0 &&
            !await _categoriaRead.TodasPertencemAoUsuarioAsync(categoriaIds, _usuarioLogado.Id, ct))
        {
            return Result<TarefaViewModel>.Failure(TarefaErrors.CategoriasInvalidas());
        }

        Result atualizarResult = tarefa.Atualizar(input.Nome, input.Prioridade, input.DataPrazo, input.HorarioFinal, input.Observacoes);
        if (atualizarResult.IsFailure)
            return Result<TarefaViewModel>.Failure(atualizarResult.Error!);

        Tarefa atualizada = await _tarefas.AtualizarAsync(tarefa, categoriaIds, ct);

        return Result<TarefaViewModel>.Success(TarefaViewModel.FromEntity(atualizada, DateTime.UtcNow));
    }
}
