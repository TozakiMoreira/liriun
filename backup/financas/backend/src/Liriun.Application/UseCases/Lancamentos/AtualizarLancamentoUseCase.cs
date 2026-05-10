using FluentValidation;
using FluentValidation.Results;
using Liriun.Application.InputModels.Lancamentos;
using Liriun.Application.Interfaces.Auth;
using Liriun.Application.ViewModels.Lancamentos;
using Liriun.Core.Common;
using Liriun.Core.Entities;
using Liriun.Core.Errors;
using Liriun.Core.Interfaces.Repositories;

namespace Liriun.Application.UseCases.Lancamentos;

public class AtualizarLancamentoUseCase
{
    private readonly ILancamentoRepository _lancamentos;
    private readonly IUsuarioLogado _usuarioLogado;
    private readonly IValidator<AtualizarLancamentoInput> _validator;

    public AtualizarLancamentoUseCase(
        ILancamentoRepository lancamentos,
        IUsuarioLogado usuarioLogado,
        IValidator<AtualizarLancamentoInput> validator)
    {
        _lancamentos = lancamentos;
        _usuarioLogado = usuarioLogado;
        _validator = validator;
    }

    public async Task<Result<LancamentoViewModel>> ExecuteAsync(Guid id, AtualizarLancamentoInput input, CancellationToken ct)
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

        Lancamento? lancamento = await _lancamentos.ObterPorIdAsync(id, _usuarioLogado.Id, ct);
        if (lancamento is null)
            return Result<LancamentoViewModel>.Failure(LancamentoErrors.NaoEncontrado());

        Result atualizar = lancamento.Atualizar(
            input.Descricao,
            input.Valor,
            input.DataReferencia,
            input.Categoria,
            input.Recorrencia,
            input.AnexoBoleto,
            input.Observacoes,
            input.DataPagamento);

        if (atualizar.IsFailure)
            return Result<LancamentoViewModel>.Failure(atualizar.Error!);

        Lancamento salvo = await _lancamentos.AtualizarAsync(lancamento, ct);
        return Result<LancamentoViewModel>.Success(LancamentoViewModel.FromEntity(salvo));
    }
}
