using Liriun.Application.InputModels.Auth;
using Liriun.Application.ReadRepositories;
using Liriun.Core.Common;

namespace Liriun.Application.UseCases.Auth;

/// <summary>
/// Esqueci-senha — stub. Sempre retorna sucesso pra não vazar quais e-mails existem.
/// Em produção: deve enfileirar envio de e-mail com token de reset (cláusula 12.x dos Termos).
/// Por ora apenas registra a tentativa e retorna OK.
/// </summary>
public class EsqueciSenhaUseCase
{
    private readonly IUsuarioReadRepository _usuarioRead;

    public EsqueciSenhaUseCase(IUsuarioReadRepository usuarioRead)
    {
        _usuarioRead = usuarioRead;
    }

    public async Task<Result> ExecuteAsync(EsqueciSenhaInput input, CancellationToken ct)
    {
        string email = (input.Email ?? string.Empty).Trim().ToLowerInvariant();
        if (email.Length == 0 || !email.Contains('@') || !email.Contains('.'))
        {
            // Mesmo com input inválido, retorna sucesso pra evitar enumeração.
            return Result.Success();
        }

        // Confirma silenciosamente se o e-mail existe (não enviar resposta diferente).
        // Quando o serviço de envio de e-mail estiver ligado, agendar mensagem aqui.
        _ = await _usuarioRead.ExisteEmailAsync(email, ct);

        // TODO(prod): emitir token de reset com expiração curta + enfileirar envio de e-mail
        return Result.Success();
    }
}
