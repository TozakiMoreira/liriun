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

public class CriarPrazoUseCase
{
    private readonly IPrazoRepository _prazos;
    private readonly IPrazoReadRepository _prazoRead;
    private readonly IUsuarioLogado _usuarioLogado;
    private readonly IValidator<CriarPrazoInput> _validator;

    public CriarPrazoUseCase(
        IPrazoRepository prazos,
        IPrazoReadRepository prazoRead,
        IUsuarioLogado usuarioLogado,
        IValidator<CriarPrazoInput> validator)
    {
        _prazos = prazos;
        _prazoRead = prazoRead;
        _usuarioLogado = usuarioLogado;
        _validator = validator;
    }

    public async Task<Result<PrazoViewModel>> ExecuteAsync(CriarPrazoInput input, CancellationToken ct)
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

        if (await _prazoRead.ExisteNomeAsync(_usuarioLogado.Id, input.Nome.Trim(), ct))
            return Result<PrazoViewModel>.Failure(PrazoErrors.NomeJaExiste());

        Result<Prazo> criacaoResult = Prazo.Criar(_usuarioLogado.Id, input.Nome, input.DuracaoDias);
        if (criacaoResult.IsFailure)
            return Result<PrazoViewModel>.Failure(criacaoResult.Error!);

        Prazo prazo = await _prazos.AdicionarAsync(criacaoResult.Value!, ct);

        return Result<PrazoViewModel>.Success(PrazoViewModel.FromEntity(prazo));
    }
}
