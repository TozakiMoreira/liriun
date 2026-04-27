namespace Jarvis.Application.ReadModels;

public sealed record PrazoReadModel(
    Guid Id,
    string Nome,
    int? DuracaoDias,
    DateTime CriadoEm);
