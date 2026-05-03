using FluentValidation;
using FluentValidation.Results;
using Liriun.Application.InputModels.Categorias;
using Liriun.Application.Interfaces.Auth;
using Liriun.Application.ReadRepositories;
using Liriun.Application.ViewModels.Categorias;
using Liriun.Core.Common;
using Liriun.Core.Entities;
using Liriun.Core.Errors;
using Liriun.Core.Interfaces.Repositories;

namespace Liriun.Application.UseCases.Categorias;

public class CriarCategoriaUseCase
{
    private readonly ICategoriaRepository _categorias;
    private readonly ICategoriaReadRepository _categoriaRead;
    private readonly IUsuarioLogado _usuarioLogado;
    private readonly IValidator<CriarCategoriaInput> _validator;

    public CriarCategoriaUseCase(
        ICategoriaRepository categorias,
        ICategoriaReadRepository categoriaRead,
        IUsuarioLogado usuarioLogado,
        IValidator<CriarCategoriaInput> validator)
    {
        _categorias = categorias;
        _categoriaRead = categoriaRead;
        _usuarioLogado = usuarioLogado;
        _validator = validator;
    }

    public async Task<Result<CategoriaViewModel>> ExecuteAsync(CriarCategoriaInput input, CancellationToken ct)
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

        if (await _categoriaRead.ExisteNomeAsync(_usuarioLogado.Id, input.Nome.Trim(), ct))
            return Result<CategoriaViewModel>.Failure(CategoriaErrors.NomeJaExiste());

        Result<Categoria> criacaoResult = Categoria.Criar(_usuarioLogado.Id, input.Nome);
        if (criacaoResult.IsFailure)
            return Result<CategoriaViewModel>.Failure(criacaoResult.Error!);

        Categoria categoria = await _categorias.AdicionarAsync(criacaoResult.Value!, ct);

        return Result<CategoriaViewModel>.Success(CategoriaViewModel.FromEntity(categoria));
    }
}
