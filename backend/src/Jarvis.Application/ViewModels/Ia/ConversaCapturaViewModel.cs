namespace Jarvis.Application.ViewModels.Ia;

/// <summary>
/// O que volta do POST /captura/conversar.
/// - Mensagem: o que mostrar no chat como resposta do Jarvis
/// - Tarefa: se nao for null, e uma tarefa pronta pra revisar/salvar
/// - Completo: indica que o bot ja considera coletou o suficiente
/// </summary>
public sealed record ConversaCapturaViewModel(
    string Mensagem,
    SugestaoTarefaViewModel? Tarefa,
    bool Completo);

public sealed record SugestaoTarefaViewModel(
    string Titulo,
    IReadOnlyList<Guid> CategoriaIds,
    DateTime? DataPrazo,
    string? HorarioFinal,
    int? Prioridade,
    string? Observacoes);
