namespace Liriun.Application.Models.Ia;

/// <summary>
/// Ação que a IA classificou pro turno. Tipo discriminador + dados específicos
/// por subclasse. Polimórfico pra escalar quando adicionarmos novas ações
/// (concluir, editar, consultar) sem mudar a API do front.
///
/// Fase 1: só Criar e Conversar estão habilitadas no prompt. As outras ficam
/// reservadas pra serem ativadas em fases seguintes (Concluir → Editar → Consultar).
/// </summary>
public abstract record AcaoIA
{
    public abstract TipoAcaoIA Tipo { get; }
}

public enum TipoAcaoIA
{
    Conversar = 0,
    Criar = 1,
    Concluir = 2,
    Editar = 3,
    Consultar = 4,
}

/// <summary>Sem ação — só conversa/resposta textual.</summary>
public sealed record AcaoConversar : AcaoIA
{
    public override TipoAcaoIA Tipo => TipoAcaoIA.Conversar;
}

/// <summary>Criar nova tarefa com os campos extraídos.</summary>
public sealed record AcaoCriar(AnaliseTarefa Tarefa) : AcaoIA
{
    public override TipoAcaoIA Tipo => TipoAcaoIA.Criar;
}

/// <summary>Concluir uma tarefa existente. Reservada pra Fase 2.</summary>
public sealed record AcaoConcluir(Guid TarefaId) : AcaoIA
{
    public override TipoAcaoIA Tipo => TipoAcaoIA.Concluir;
}

/// <summary>Editar uma tarefa existente. Mudancas tem só os campos a alterar (resto null). Reservada pra Fase 3.</summary>
public sealed record AcaoEditar(Guid TarefaId, AnaliseTarefa Mudancas) : AcaoIA
{
    public override TipoAcaoIA Tipo => TipoAcaoIA.Editar;
}

/// <summary>Consultar tarefas com filtros. Reservada pra Fase 4.</summary>
public sealed record AcaoConsultar(FiltrosConsulta Filtros) : AcaoIA
{
    public override TipoAcaoIA Tipo => TipoAcaoIA.Consultar;
}

public sealed record FiltrosConsulta(
    string? Status,        // "pendente" | "atrasada" | "concluida" | null
    Guid? CategoriaId,
    int? Prioridade,
    string? Periodo);      // "hoje" | "amanha" | "semana" | null
