using FluentValidation;
using FluentValidation.Results;
using Liriun.Application.InputModels.Lancamentos;
using Liriun.Application.Interfaces.Auth;
using Liriun.Application.ViewModels.Lancamentos;
using Liriun.Core.Common;
using Liriun.Core.Entities;
using Liriun.Core.Interfaces.Repositories;

namespace Liriun.Application.UseCases.Lancamentos;

public class CriarLancamentoUseCase
{
    private readonly ILancamentoRepository _lancamentos;
    private readonly IUsuarioLogado _usuarioLogado;
    private readonly IValidator<CriarLancamentoInput> _validator;

    public CriarLancamentoUseCase(
        ILancamentoRepository lancamentos,
        IUsuarioLogado usuarioLogado,
        IValidator<CriarLancamentoInput> validator)
    {
        _lancamentos = lancamentos;
        _usuarioLogado = usuarioLogado;
        _validator = validator;
    }

    public async Task<Result<LancamentoViewModel>> ExecuteAsync(CriarLancamentoInput input, CancellationToken ct)
    {
        ValidationResult validation = await _validator.ValidateAsync(input, ct);
        if (!validation.IsValid)
        {
            Dictionary<string, string[]> details = validation.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return Result<LancamentoViewModel>.Failure(
                Error.Validation("lancamento.validacao", "Dados invalidos", details));
        }

        Result<Lancamento> criacaoResult = Lancamento.Criar(
            _usuarioLogado.Id,
            input.Tipo,
            input.Descricao,
            input.Valor,
            input.DataReferencia,
            input.Categoria,
            input.Recorrencia,
            input.AnexoBoleto,
            input.Observacoes);

        if (criacaoResult.IsFailure)
            return Result<LancamentoViewModel>.Failure(criacaoResult.Error!);

        Lancamento salvo = await _lancamentos.AdicionarAsync(criacaoResult.Value!, ct);
        return Result<LancamentoViewModel>.Success(LancamentoViewModel.FromEntity(salvo));
    }
}
