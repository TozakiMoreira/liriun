using Jarvis.Application.Models.Ia;
using Jarvis.Core.Common;

namespace Jarvis.Application.Interfaces.Ia;

public interface IGeminiService
{
    /// <summary>
    /// Conduz um turno de conversa com a IA, dado o historico ate aqui.
    /// Retorna uma mensagem do bot e, opcionalmente, uma tarefa pronta
    /// quando a IA julgar que coletou tudo.
    /// </summary>
    Task<Result<RespostaConversa>> ConversarAsync(ContextoConversa contexto, CancellationToken ct);
}
