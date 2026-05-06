using Liriun.Application.ReadModels;
using Liriun.Application.ReadRepositories;
using Liriun.Core.Enums;
using Liriun.Infrastructure.Persistence;
using Liriun.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace Liriun.Infrastructure.ReadRepositories;

public class TarefaReadRepository : ITarefaReadRepository
{
    private readonly LiriunDbContext _db;

    public TarefaReadRepository(LiriunDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<TarefaReadModel>> ListarPendentesAsync(Guid usuarioId, CancellationToken ct)
        => await _db.Tarefas.AsNoTracking()
            .Where(t => t.UsuarioId == usuarioId && t.Status == StatusTarefa.Pendente)
            .OrderBy(t => t.DataPrazo)
            .ThenBy(t => t.Prioridade)
            .Select(t => new TarefaReadModel(
                t.Id,
                t.Nome,
                t.Prioridade,
                t.Status,
                t.DataPrazo,
                t.HorarioFinal,
                t.Observacoes,
                t.Recorrencia,
                t.CriadaEm,
                t.ConcluidaEm,
                t.Categorias
                    .Where(tc => tc.Categoria != null)
                    .Select(tc => new TarefaCategoriaReadModel(tc.CategoriaId, tc.Categoria!.Nome))
                    .ToList()))
            .ToListAsync(ct);

    public async Task<IReadOnlyList<TarefaReadModel>> ListarConcluidasAsync(Guid usuarioId, DateTime? de, DateTime? ate, CancellationToken ct)
    {
        IQueryable<TarefaModel> query = _db.Tarefas.AsNoTracking()
            .Where(t => t.UsuarioId == usuarioId && t.Status == StatusTarefa.Concluida);

        if (de.HasValue)
            query = query.Where(t => t.ConcluidaEm >= de.Value);

        if (ate.HasValue)
            query = query.Where(t => t.ConcluidaEm <= ate.Value);

        return await query
            .OrderByDescending(t => t.ConcluidaEm)
            .Select(t => new TarefaReadModel(
                t.Id,
                t.Nome,
                t.Prioridade,
                t.Status,
                t.DataPrazo,
                t.HorarioFinal,
                t.Observacoes,
                t.Recorrencia,
                t.CriadaEm,
                t.ConcluidaEm,
                t.Categorias
                    .Where(tc => tc.Categoria != null)
                    .Select(tc => new TarefaCategoriaReadModel(tc.CategoriaId, tc.Categoria!.Nome))
                    .ToList()))
            .ToListAsync(ct);
    }
}
