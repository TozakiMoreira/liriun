using Jarvis.Application.ReadModels;
using Jarvis.Application.ReadRepositories;
using Jarvis.Core.Enums;
using Jarvis.Infrastructure.Persistence;
using Jarvis.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace Jarvis.Infrastructure.ReadRepositories;

public class TarefaReadRepository : ITarefaReadRepository
{
    private readonly JarvisDbContext _db;

    public TarefaReadRepository(JarvisDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<TarefaReadModel>> ListarPendentesAsync(Guid usuarioId, CancellationToken ct)
        => await _db.Tarefas.AsNoTracking()
            .Where(t => t.UsuarioId == usuarioId && t.Status == StatusTarefa.Pendente)
            .OrderBy(t => t.DataPrazo ?? DateTime.MaxValue)
            .ThenBy(t => t.Prioridade)
            .Select(t => new TarefaReadModel(
                t.Id,
                t.Nome,
                t.Prioridade,
                t.Status,
                t.PrazoId,
                t.DataPrazo,
                t.HorarioFinal,
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
                t.PrazoId,
                t.DataPrazo,
                t.HorarioFinal,
                t.CriadaEm,
                t.ConcluidaEm,
                t.Categorias
                    .Where(tc => tc.Categoria != null)
                    .Select(tc => new TarefaCategoriaReadModel(tc.CategoriaId, tc.Categoria!.Nome))
                    .ToList()))
            .ToListAsync(ct);
    }
}
