using FluentValidation;
using FluentValidation.Results;
using Jarvis.Application.InputModels.Prazos;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ReadRepositories;
using Jarvis.Application.ViewModels.Prazos;
using Jarvis.Core.Common;
using Jarvis.Core.Entities;
using Jarvis.Core.Errors;
using Jarvis.Core.Interfaces.Repositories;

namespace Jarvis.Application.UseCases.Prazos;

public class AtualizarPrazoUseCase
{
    private readonly IPrazoRepository _prazos;
    private readonly IPrazoReadRepository _prazoRead;
    private readonly IUsuarioLogado _usuarioLogado;
    private readonly IValidator<AtualizarPrazoInput> _validator;

    public AtualizarPrazoUseCase(
        IPrazoRepository prazos,
        IPrazoReadRepository prazoRead,
        IUsuarioLogado usuarioLogado,
        IValidator<AtualizarPrazoInput> validator)
    {
        _prazos = prazos;
        _prazoRead = prazoRead;
        _usuarioLogado = usuarioLogado;
        _validator = validator;
    }

    public async Task<Result<PrazoViewModel>> ExecuteAsync(Guid id, AtualizarPrazoInput input, CancellationToken ct)
    {
        ValidationResult validation = await _validator.ValidateAsync(input, ct);
        if (!validation.IsValid)
        {
            Dictionary<string, string[]> details = validation.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return Result<PrazoViewModel>.Failure(
                Error.Validation("prazo.validacao", "Dados invalidos", details));
        }

        Prazo? prazo = await _prazos.ObterPorIdAsync(id, _usuarioLogado.Id, ct);
        if (prazo is null)
            return Result<PrazoViewModel>.Failure(PrazoErrors.NaoEncontrado());

        if (await _prazoRead.ExisteOutraComNomeAsync(_usuarioLogado.Id, input.Nome.Trim(), id, ct))
            return Result<PrazoViewModel>.Failure(PrazoErrors.NomeJaExiste());

        Result atualizarResult = prazo.Atualizar(input.Nome, input.DuracaoDias);
        if (atualizarResult.IsFailure)
            return Result<PrazoViewModel>.Failure(atualizarResult.Error!);

        Prazo atualizado = await _prazos.AtualizarAsync(prazo, ct);

        return Result<PrazoViewModel>.Success(PrazoViewModel.FromEntity(atualizado));
    }
}
