namespace Jarvis.Application.InputModels.Ia;

public sealed record MensagemInput(string Papel, string Texto);

public sealed record ConversarCapturaInput(IReadOnlyList<MensagemInput> Mensagens);
