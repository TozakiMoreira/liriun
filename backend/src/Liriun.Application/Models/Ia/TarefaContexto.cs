namespace Liriun.Application.Models.Ia;

/// <summary>
/// Tarefa enviada pra IA como contexto — permite que ela se refira a tarefas
/// existentes do usuário (concluir/editar/consultar). Versão "achatada" do
/// TarefaReadModel com só o que a IA precisa pra classificar e identificar.
/// </summary>
public sealed record TarefaContexto(
    Guid Id,
    string Titulo,
    DateTime DataPrazo,
    int Prioridade,
    int Status,
    string? CategoriaNome);
