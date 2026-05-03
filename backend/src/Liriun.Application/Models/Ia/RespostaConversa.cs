namespace Liriun.Application.Models.Ia;

/// <summary>
/// Resposta do Gemini num turno da conversa.
/// - Mensagem: o que o bot fala (sempre presente)
/// - Tarefa: se nao for null, significa que o bot ja consolidou os campos
///           e esta propondo salvar. Front pode mostrar preview com botao Salvar.
/// - Completo: indica que o bot considera a coleta finalizada
/// - TranscricaoUsuario: preenchida apenas quando o turno foi iniciado por audio,
///   contem o que o Gemini transcreveu da fala do usuario para o front exibir.
/// </summary>
public sealed record RespostaConversa(
    string Mensagem,
    AnaliseTarefa? Tarefa,
    bool Completo,
    string? TranscricaoUsuario = null);
