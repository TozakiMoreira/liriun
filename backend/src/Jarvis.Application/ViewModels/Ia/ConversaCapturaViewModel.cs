namespace Jarvis.Application.ViewModels.Ia;

/// <summary>
/// O que volta do POST /captura/conversar (e /conversar-audio).
/// - Mensagem: o que mostrar no chat como resposta do Jarvis
/// - Tarefa: se nao for null, e uma tarefa pronta pra revisar/salvar
/// - Completo: indica que o bot ja considera coletou o suficiente
/// - TranscricaoUsuario: preenchida apenas em respostas de audio,
///   permite ao front exibir o que foi transcrito como bolha do usuario.
/// </summary>
public sealed record ConversaCapturaViewModel(
    string Mensagem,
    SugestaoTarefaViewModel? Tarefa,
    bool Completo,
    string? TranscricaoUsuario = null);

public sealed record SugestaoTarefaViewModel(
    string Titulo,
    IReadOnlyList<Guid> CategoriaIds,
    DateTime? DataPrazo,
    string? HorarioFinal,
    int? Prioridade,
    string? Observacoes);
