using Jarvis.Core.Entities;

namespace Jarvis.Application.ViewModels.Prazos;

public class PrazoViewModel
{
    public Guid Id { get; init; }
    public string Nome { get; init; } = null!;
    public int? DuracaoDias { get; init; }
    public DateTime CriadoEm { get; init; }

    public static PrazoViewModel From(Prazo prazo) => new()
    {
        Id = prazo.Id,
        Nome = prazo.Nome,
        DuracaoDias = prazo.DuracaoDias,
        CriadoEm = prazo.CriadoEm
    };
}
