using Jarvis.Core.Entities;
using Jarvis.Core.Interfaces.Repositories;
using Jarvis.Infra.Data;
using Microsoft.EntityFrameworkCore;

namespace Jarvis.Infra.Repositories;

public partial class TarefaRepository : ITarefaRepository
{
    private readonly JarvisDbContext _db;

    public TarefaRepository(JarvisDbContext db)
    {
        _db = db;
    }

    public async Task Adicionar(Tarefa tarefa, IEnumerable<Guid> categoriaIds, CancellationToken ct = default)
    {
        await _db.Tarefas.AddAsync(tarefa, ct);

        foreach (var catId in categoriaIds.Distinct())
            await _db.TarefasCategorias.AddAsync(new TarefaCategoria(tarefa.Id, catId), ct);

        await _db.SaveChangesAsync(ct);
    }

    public async Task Atualizar(Tarefa tarefa, IEnumerable<Guid> categoriaIds, CancellationToken ct = default)
    {
        _db.Tarefas.Update(tarefa);

        var atuais = await _db.TarefasCategorias
            .Where(tc => tc.TarefaId == tarefa.Id)
            .ToListAsync(ct);

        _db.TarefasCategorias.RemoveRange(atuais);

        foreach (var catId in categoriaIds.Distinct())
            await _db.TarefasCategorias.AddAsync(new TarefaCategoria(tarefa.Id, catId), ct);

        await _db.SaveChangesAsync(ct);
    }

    public async Task Concluir(Tarefa tarefa, CancellationToken ct = default)
    {
        _db.Tarefas.Update(tarefa);
        await _db.SaveChangesAsync(ct);
    }

    public async Task Remover(Tarefa tarefa, CancellationToken ct = default)
    {
        _db.Tarefas.Remove(tarefa);
        await _db.SaveChangesAsync(ct);
    }
}
