namespace Liriun.Application.ReadModels;

/// <summary>Projecao de leitura para a listagem admin de codigos beta.</summary>
public record CodigoBetaReadModel(
    Guid Id,
    string Codigo,
    DateTime CriadoEm,
    DateTime? UsadoEm,
    DateTime? RevogadoEm,
    DateTime? ExpiraEm,
    string? UsadoPorEmail);
