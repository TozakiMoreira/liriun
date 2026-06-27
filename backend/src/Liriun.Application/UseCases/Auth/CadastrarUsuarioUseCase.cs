using FluentValidation;
using FluentValidation.Results;
using Liriun.Application.InputModels.Auth;
using Liriun.Application.Interfaces;
using Liriun.Application.Interfaces.Auth;
using Liriun.Application.ReadRepositories;
using Liriun.Application.ViewModels.Auth;
using Liriun.Core.Common;
using Liriun.Core.Entities;
using Liriun.Core.Errors;
using Liriun.Core.Interfaces.Repositories;

namespace Liriun.Application.UseCases.Auth;

public class CadastrarUsuarioUseCase
{
    private readonly IUsuarioRepository _usuarios;
    private readonly IUsuarioReadRepository _usuarioRead;
    private readonly ICodigoBetaRepository _codigosBeta;
    private readonly IUnitOfWork _uow;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenService _jwt;
    private readonly IValidator<CadastrarUsuarioInput> _validator;

    public CadastrarUsuarioUseCase(
        IUsuarioRepository usuarios,
        IUsuarioReadRepository usuarioRead,
        ICodigoBetaRepository codigosBeta,
        IUnitOfWork uow,
        IPasswordHasher hasher,
        IJwtTokenService jwt,
        IValidator<CadastrarUsuarioInput> validator)
    {
        _usuarios = usuarios;
        _usuarioRead = usuarioRead;
        _codigosBeta = codigosBeta;
        _uow = uow;
        _hasher = hasher;
        _jwt = jwt;
        _validator = validator;
    }

    public async Task<Result<AutenticacaoViewModel>> ExecuteAsync(CadastrarUsuarioInput input, CancellationToken ct)
    {
        ValidationResult validation = await _validator.ValidateAsync(input, ct);
        if (!validation.IsValid)
        {
            Dictionary<string, string[]> details = validation.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return Result<AutenticacaoViewModel>.Failure(
                Error.Validation("usuario.validacao", "Dados invalidos", details));
        }

        string emailNormalizado = input.Email.Trim().ToLowerInvariant();

        // Checa o email ANTES de tocar no codigo, para nao desperdiciar o codigo num
        // cadastro que ja falharia por email duplicado.
        if (await _usuarioRead.ExisteEmailAsync(emailNormalizado, ct))
            return Result<AutenticacaoViewModel>.Failure(UsuarioErrors.EmailJaCadastrado());

        string senhaHash = _hasher.Hash(input.Senha);
        Result<Usuario> criacaoResult = Usuario.Criar(input.Nome, emailNormalizado, senhaHash, DateTime.UtcNow, input.TimeZoneId);
        if (criacaoResult.IsFailure)
            return Result<AutenticacaoViewModel>.Failure(criacaoResult.Error!);

        Usuario usuario = criacaoResult.Value!;
        string codigoNormalizado = CodigoBeta.Normalizar(input.CodigoBeta);

        // Consumo do codigo + criacao do usuario na MESMA transacao: se um falha, o outro
        // e desfeito (o codigo so e "gasto" se a conta realmente for criada).
        Result<Usuario> persistencia = await _uow.ExecuteInTransactionAsync(async token =>
        {
            Result consumo = await _codigosBeta.ConsumirAtomicoAsync(codigoNormalizado, usuario.Id, DateTime.UtcNow, token);
            if (consumo.IsFailure)
                return Result<Usuario>.Failure(consumo.Error!);

            await _usuarios.AdicionarAsync(usuario, token);
            return Result<Usuario>.Success(usuario);
        }, ct);

        if (persistencia.IsFailure)
            return Result<AutenticacaoViewModel>.Failure(persistencia.Error!);

        (string token, DateTime expira) = _jwt.Gerar(usuario);

        return Result<AutenticacaoViewModel>.Success(
            new AutenticacaoViewModel(usuario.Id, usuario.Nome, usuario.Email, usuario.FotoUrl, token, expira, usuario.EhAdmin));
    }
}
