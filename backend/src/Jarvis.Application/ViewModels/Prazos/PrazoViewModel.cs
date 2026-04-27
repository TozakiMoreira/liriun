using Jarvis.Application.ReadModels;
using Jarvis.Core.Entities;

namespace Jarvis.Application.ViewModels.Prazos;

public sealed record PrazoViewModel(
    Guid Id,
    string Nome,
    int? DuracaoDias,
    DateTime CriadoEm)
{
    public static PrazoViewModel FromEntity(Prazo prazo)
        => new(prazo.Id, prazo.Nome, prazo.DuracaoDias, prazo.CriadoEm);

    public static PrazoViewModel FromReadModel(PrazoReadModel readModel)
        => new(readModel.Id, readModel.Nome, readModel.DuracaoDias, readModel.CriadoEm);
}
