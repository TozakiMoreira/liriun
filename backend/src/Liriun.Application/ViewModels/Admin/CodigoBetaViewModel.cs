using Liriun.Application.ReadModels;
using Liriun.Core.Entities;

namespace Liriun.Application.ViewModels.Admin;

public sealed record CodigoBetaViewModel(
    Guid Id,
    string Codigo,
    string Status,
    DateTime CriadoEm,
    DateTime? UsadoEm,
    DateTime? RevogadoEm,
    DateTime? ExpiraEm,
    string? UsadoPorEmail)
{
    public static CodigoBetaViewModel FromReadModel(CodigoBetaReadModel m)
        => new(m.Id, m.Codigo, CalcularStatus(m.UsadoEm, m.RevogadoEm, m.ExpiraEm),
               m.CriadoEm, m.UsadoEm, m.RevogadoEm, m.ExpiraEm, m.UsadoPorEmail);

    public static CodigoBetaViewModel FromEntity(CodigoBeta c)
        => new(c.Id, c.Codigo, CalcularStatus(c.UsadoEm, c.RevogadoEm, c.ExpiraEm),
               c.CriadoEm, c.UsadoEm, c.RevogadoEm, c.ExpiraEm, null);

    private static string CalcularStatus(DateTime? usadoEm, DateTime? revogadoEm, DateTime? expiraEm)
    {
        if (revogadoEm is not null) return "revogado";
        if (usadoEm is not null) return "usado";
        if (expiraEm is not null && expiraEm <= DateTime.UtcNow) return "expirado";
        return "disponivel";
    }
}
