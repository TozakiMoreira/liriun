using Liriun.Core.Entities;
using Liriun.Core.Interfaces.Repositories;
using Liriun.Infrastructure.Persistence;
using Liriun.Infrastructure.Persistence.Mappers;
using Liriun.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace Liriun.Infrastructure.Repositories;

public class TarefaRepository : ITarefaRepository
{
    private readonly LiriunDbContext _db;

    public TarefaRepository(LiriunDbContext db)
    {
        _db = db;
    }

    public async Task<Tarefa?> ObterPorIdAsync(Guid id, Guid usuarioId, CancellationToken ct)
    {
        TarefaModel? model = await _db.Tarefas.AsNoTracking()
            .Include(t => t.Categorias).ThenInclude(tc => tc.Categoria)
            .FirstOrDefaultAsync(t => t.Id == id && t.UsuarioId == usuarioId, ct);

        return model is null ? null : TarefaMapper.ToEntity(model);
    }

    public async Task<Tarefa> AdicionarAsync(Tarefa tarefa, IEnumerable<Guid> categoriaIds, CancellationToken ct)
    {
        TarefaModel model = TarefaMapper.ToModel(tarefa);
        await _db.Tarefas.AddAsync(model, ct);

        foreach (Guid catId in categoriaIds.Distinct())
            await _db.TarefasCategorias.AddAsync(
                new TarefaCategoriaModel { TarefaId = tarefa.Id, CategoriaId = catId }, ct);

        await _db.SaveChangesAsync(ct);

        return await RecarregarAsync(tarefa.Id, tarefa.UsuarioId, ct);
    }

    public async Task<Tarefa> AtualizarAsync(Tarefa tarefa, IEnumerable<Guid> categoriaIds, CancellationToken ct)
    {
        TarefaModel model = TarefaMapper.ToModel(tarefa);
        _db.Tarefas.Update(model);

        List<TarefaCategoriaModel> atuais = await _db.TarefasCategorias
            .Where(tc => tc.TarefaId == tarefa.Id)
            .ToListAsync(ct);

        _db.TarefasCategorias.RemoveRange(atuais);

        foreach (Guid catId in categoriaIds.Distinct())
            await _db.TarefasCategorias.AddAsync(
                new TarefaCategoriaModel { TarefaId = tarefa.Id, CategoriaId = catId }, ct);

        await _db.SaveChangesAsync(ct);

        return await RecarregarAsync(tarefa.Id, tarefa.UsuarioId, ct);
    }

    public async Task RemoverAsync(Tarefa tarefa, CancellationToken ct)
    {
        TarefaModel model = TarefaMapper.ToModel(tarefa);
        _db.Tarefas.Remove(model);
        await _db.SaveChangesAsync(ct);
    }

    private async Task<Tarefa> RecarregarAsync(Guid id, Guid usuarioId, CancellationToken ct)
    {
        TarefaModel reloaded = await _db.Tarefas.AsNoTracking()
            .Include(t => t.Categorias).ThenInclude(tc => tc.Categoria)
            .FirstAsync(t => t.Id == id && t.UsuarioId == usuarioId, ct);

        return TarefaMapper.ToEntity(reloaded);
    }
}
