using Jarvis.Core.Exceptions;

namespace Jarvis.Core.Entities;

/// <summary>
/// Template de duração nomeada (ex: "Hoje" = 0 dias, "Amanhã" = 1 dia, "Essa semana" = 7 dias).
/// DuracaoDias = null representa "Sem prazo".
/// </summary>
public class Prazo
{
    public Guid Id { get; private set; }
    public Guid UsuarioId { get; private set; }
    public string Nome { get; private set; } = null!;
    public int? DuracaoDias { get; private set; }
    public DateTime CriadoEm { get; private set; }

    private Prazo() { }

    public Prazo(Guid usuarioId, string nome, int? duracaoDias)
    {
        Id = Guid.NewGuid();
        UsuarioId = usuarioId;
        Nome = nome?.Trim() ?? string.Empty;
        DuracaoDias = duracaoDias;
        CriadoEm = DateTime.UtcNow;
        Validar();
    }

    private void Validar()
    {
        if (UsuarioId == Guid.Empty)
            throw new PrazoException("Prazo precisa estar vinculado a um usuário");

        if (string.IsNullOrWhiteSpace(Nome))
            throw new PrazoException("Nome do prazo é obrigatório");

        if (Nome.Length > 50)
            throw new PrazoException("Nome do prazo não pode passar de 50 caracteres");

        if (DuracaoDias.HasValue && DuracaoDias.Value < 0)
            throw new PrazoException("Duração em dias não pode ser negativa");
    }

    public DateTime? ResolverDataPrazo(DateTime referencia)
    {
        if (!DuracaoDias.HasValue)
            return null;

        return referencia.Date.AddDays(DuracaoDias.Value);
    }

    public void Atualizar(string novoNome, int? novaDuracao)
    {
        Nome = novoNome?.Trim() ?? string.Empty;
        DuracaoDias = novaDuracao;
        Validar();
    }
}
