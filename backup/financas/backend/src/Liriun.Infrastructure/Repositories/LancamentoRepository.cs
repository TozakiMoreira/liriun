using Liriun.Core.Entities;
using Liriun.Core.Interfaces.Repositories;
using Liriun.Infrastructure.Persistence;
using Liriun.Infrastructure.Persistence.Mappers;
using Liriun.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace Liriun.Infrastructure.Repositories;

public class LancamentoRepository : ILancamentoRepository
{
    private readonly LiriunDbContext _db;

    public LancamentoRepository(LiriunDbContext db)
    {
        _db = db;
    }

    public async Task<Lancamento?> ObterPorIdAsync(Guid id, Guid usuarioId, CancellationToken ct)
    {
        LancamentoModel? model = await _db.Lancamentos.AsNoTracking()
            .FirstOrDefaultAsync(l => l.Id == id && l.UsuarioId == usuarioId, ct);
        return model is null ? null : LancamentoMapper.ToEntity(model);
    }

    public async Task<Lancamento> AdicionarAsync(Lancamento lancamento, CancellationToken ct)
    {
        LancamentoModel model = LancamentoMapper.ToModel(lancamento);
        await _db.Lancamentos.AddAsync(model, ct);
        await _db.SaveChangesAsync(ct);
        return LancamentoMapper.ToEntity(model);
    }

    public async Task<Lancamento> AtualizarAsync(Lancamento lancamento, CancellationToken ct)
    {
        LancamentoModel model = LancamentoMapper.ToModel(lancamento);
        _db.Lancamentos.Update(model);
        await _db.SaveChangesAsync(ct);
        return LancamentoMapper.ToEntity(model);
    }

    public async Task RemoverAsync(Lancamento lancamento, CancellationToken ct)
    {
        LancamentoModel model = LancamentoMapper.ToModel(lancamento);
        _db.Lancamentos.Remove(model);
        await _db.SaveChangesAsync(ct);
    }
}
