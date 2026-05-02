namespace Jarvis.Infrastructure.Ia;

public class GeminiOptions
{
    public const string SectionName = "Gemini";

    public string ApiKey { get; set; } = string.Empty;
    public string Model { get; set; } = "gemini-2.0-flash";
    public string BaseUrl { get; set; } = "https://generativelanguage.googleapis.com/v1beta";
    public int TimeoutSeconds { get; set; } = 90;

    /// <summary>
    /// Quando true, Jarvis pode fazer ate 3 perguntas de contexto antes de fechar a tarefa
    /// e enriquece observacoes com checklist (modo "interativo").
    /// Quando false (default), modo "one-shot": extrai a tarefa do texto do usuario sem perguntar,
    /// observacoes recebem o "onde/como" cru. Reduz consumo de tokens.
    /// Reservado pra plano pago futuro (usuario decide).
    /// </summary>
    public bool ModoInterativo { get; set; } = false;
}
