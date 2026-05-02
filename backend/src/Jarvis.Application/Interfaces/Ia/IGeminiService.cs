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

    /// <summary>
    /// Conduz um turno de conversa em que a mensagem nova do usuario e um audio.
    /// O Gemini transcreve E analisa numa unica chamada (multimodal). A transcricao
    /// volta em RespostaConversa.TranscricaoUsuario para o front mostrar como bolha
    /// do usuario no chat.
    /// </summary>
    Task<Result<RespostaConversa>> ConversarComAudioAsync(
        ContextoConversa contexto,
        ReadOnlyMemory<byte> audio,
        string mimeType,
        CancellationToken ct);
}
