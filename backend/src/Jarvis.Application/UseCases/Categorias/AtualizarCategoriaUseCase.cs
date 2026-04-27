using FluentValidation;
using FluentValidation.Results;
using Jarvis.Application.InputModels.Categorias;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ReadRepositories;
using Jarvis.Application.ViewModels.Categorias;
using Jarvis.Core.Common;
using Jarvis.Core.Entities;
using Jarvis.Core.Errors;
using Jarvis.Core.Interfaces.Repositories;

namespace Jarvis.Application.UseCases.Categorias;

public class AtualizarCategoriaUseCase
{
    private readonly ICategoriaRepository _categorias;
    private readonly ICategoriaReadRepository _categoriaRead;
    private readonly IUsuarioLogado _usuarioLogado;
    private readonly IValidator<AtualizarCategoriaInput> _validator;

    public AtualizarCategoriaUseCase(
        ICategoriaRepository categorias,
        ICategoriaReadRepository categoriaRead,
        IUsuarioLogado usuarioLogado,
        IValidator<AtualizarCategoriaInput> validator)
    {
        _categorias = categorias;
        _categoriaRead = categoriaRead;
        _usuarioLogado = usuarioLogado;
        _validator = validator;
    }

    public async Task<Result<CategoriaViewModel>> ExecuteAsync(Guid id, AtualizarCategoriaInput input, CancellationToken ct)
    {
        ValidationResult validation = await _validator.ValidateAsync(input, ct);
        if (!validation.IsValid)
        {
            Dictionary<string, string[]> details = validation.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return Result<CategoriaViewModel>.Failure(
                Error.Validation("categoria.validacao", "Dados invalidos", details));
        }

        Categoria? categoria = await _categorias.ObterPorIdAsync(id, _usuarioLogado.Id, ct);
        if (categoria is null)
            return Result<CategoriaViewModel>.Failure(CategoriaErrors.NaoEncontrada());

        if (await _categoriaRead.ExisteOutraComNomeAsync(_usuarioLogado.Id, input.Nome.Trim(), id, ct))
            return Result<CategoriaViewModel>.Failure(CategoriaErrors.NomeJaExiste());

        Result renomearResult = categoria.Renomear(input.Nome);
        if (renomearResult.IsFailure)
            return Result<CategoriaViewModel>.Failure(renomearResult.Error!);

        Categoria atualizada = await _categorias.AtualizarAsync(categoria, ct);

        return Result<CategoriaViewModel>.Success(CategoriaViewModel.FromEntity(atualizada));
    }
}
