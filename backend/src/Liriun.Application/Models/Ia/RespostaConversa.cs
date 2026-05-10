namespace Liriun.Application.Models.Ia;

/// <summary>
/// Resposta do Gemini num turno da conversa.
/// - Mensagem: o que o bot fala (sempre presente)
/// - Acao: ação classificada pra esse turno. Polimórfica.
///         Em Fase 1: só Criar/Conversar são geradas pelo prompt.
///         Outras (Concluir/Editar/Consultar) serão liberadas em fases seguintes.
/// - Completo: indica que o bot considera a coleta finalizada
/// - TranscricaoUsuario: preenchida apenas quando o turno foi iniciado por audio,
///   contem o que o Gemini transcreveu da fala do usuario para o front exibir.
/// </summary>
public sealed record RespostaConversa(
    string Mensagem,
    AcaoIA Acao,
    bool Completo,
    string? TranscricaoUsuario = null);
