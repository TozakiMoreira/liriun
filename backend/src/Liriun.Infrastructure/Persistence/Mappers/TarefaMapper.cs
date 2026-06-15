using Liriun.Core.Entities;
using Liriun.Infrastructure.Persistence.Models;

namespace Liriun.Infrastructure.Persistence.Mappers;

internal static class TarefaMapper
{
    public static TarefaModel ToModel(Tarefa entity) => new()
    {
        Id = entity.Id,
        UsuarioId = entity.UsuarioId,
        Nome = entity.Nome,
        DataPrazo = entity.DataPrazo,
        HorarioFinal = entity.HorarioFinal,
        Observacoes = entity.Observacoes,
        Prioridade = entity.Prioridade,
        Status = entity.Status,
        Recorrencia = entity.Recorrencia,
        RecorrenciaQuantidade = entity.RecorrenciaQuantidade,
        CriadaEm = entity.CriadaEm,
        ConcluidaEm = entity.ConcluidaEm,
        TempoGastoSegundos = entity.TempoGastoSegundos
    };

    public static Tarefa ToEntity(TarefaModel model)
    {
        List<TarefaCategoria> categorias = model.Categorias
            .Select(tc => TarefaCategoria.Reconstituir(
                tc.TarefaId,
                tc.CategoriaId,
                tc.Categoria is not null
                    ? Categoria.Reconstituir(tc.Categoria.Id, tc.Categoria.UsuarioId, tc.Categoria.Nome, tc.Categoria.CriadaEm)
                    : null))
            .ToList();

        return Tarefa.Reconstituir(
            model.Id,
            model.UsuarioId,
            model.Nome,
            model.DataPrazo,
            model.HorarioFinal,
            model.Observacoes,
            model.Prioridade,
            model.Status,
            model.Recorrencia,
            model.RecorrenciaQuantidade,
            model.CriadaEm,
            model.ConcluidaEm,
            categorias,
            model.TempoGastoSegundos);
    }
}
