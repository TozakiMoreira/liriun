using Jarvis.Core.Entities;
using Jarvis.Infrastructure.Persistence.Models;

namespace Jarvis.Infrastructure.Persistence.Mappers;

internal static class TarefaMapper
{
    public static TarefaModel ToModel(Tarefa entity) => new()
    {
        Id = entity.Id,
        UsuarioId = entity.UsuarioId,
        Nome = entity.Nome,
        PrazoId = entity.PrazoId,
        DataPrazo = entity.DataPrazo,
        HorarioFinal = entity.HorarioFinal,
        Prioridade = entity.Prioridade,
        Status = entity.Status,
        CriadaEm = entity.CriadaEm,
        ConcluidaEm = entity.ConcluidaEm
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
            model.PrazoId,
            model.DataPrazo,
            model.HorarioFinal,
            model.Prioridade,
            model.Status,
            model.CriadaEm,
            model.ConcluidaEm,
            categorias);
    }
}
