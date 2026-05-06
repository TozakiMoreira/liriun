using Liriun.Application.ReadModels;
using Liriun.Application.ReadRepositories;
using Liriun.Core.Enums;
using Liriun.Infrastructure.Persistence;
using Liriun.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace Liriun.Infrastructure.ReadRepositories;

public class LancamentoReadRepository : ILancamentoReadRepository
{
    private readonly LiriunDbContext _db;

    public LancamentoReadRepository(LiriunDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<LancamentoReadModel>> ListarAsync(Guid usuarioId, int? ano, int? mes, CancellationToken ct)
    {
        IQueryable<LancamentoModel> query = _db.Lancamentos.AsNoTracking()
            .Where(l => l.UsuarioId == usuarioId);

        if (ano.HasValue)
            query = query.Where(l => l.DataReferencia.Year == ano.Value);

        if (mes.HasValue)
            query = query.Where(l => l.DataReferencia.Month == mes.Value);

        return await query
            .OrderBy(l => l.DataReferencia)
            .ThenBy(l => l.Descricao)
            .Select(l => new LancamentoReadModel(
                l.Id,
                l.Tipo,
                l.Descricao,
                l.Valor,
                l.DataReferencia,
                l.Categoria,
                l.Status,
                l.Recorrencia,
                l.AnexoBoleto != null && l.AnexoBoleto != "",
                l.Observacoes,
                l.CriadoEm,
                l.PagoEm))
            .ToListAsync(ct);
    }

    public async Task<BalancoReadModel> ObterBalancoAsync(Guid usuarioId, int ano, int? mes, CancellationToken ct)
    {
        IQueryable<LancamentoModel> query = _db.Lancamentos.AsNoTracking()
            .Where(l => l.UsuarioId == usuarioId && l.DataReferencia.Year == ano);

        if (mes.HasValue)
            query = query.Where(l => l.DataReferencia.Month == mes.Value);

        List<LancamentoModel> lista = await query.ToListAsync(ct);

        decimal totalReceitas = lista.Where(l => l.Tipo == TipoLancamento.Receita).Sum(l => l.Valor);
        decimal totalDespesasPagas = lista.Where(l => l.Tipo == TipoLancamento.Despesa && l.Status == StatusLancamento.Pago).Sum(l => l.Valor);
        decimal totalDespesasPendentes = lista.Where(l => l.Tipo == TipoLancamento.Despesa && l.Status == StatusLancamento.Pendente).Sum(l => l.Valor);
        decimal saldo = totalReceitas - totalDespesasPagas;

        List<BalancoCategoriaReadModel> porCategoria = lista
            .GroupBy(l => new { l.Categoria, l.Tipo })
            .Select(g => new BalancoCategoriaReadModel(g.Key.Categoria, g.Key.Tipo, g.Sum(l => l.Valor)))
            .OrderByDescending(c => c.Total)
            .ToList();

        List<BalancoMesReadModel> porMes = lista
            .GroupBy(l => l.DataReferencia.Month)
            .Select(g => new BalancoMesReadModel(
                g.Key,
                g.Where(l => l.Tipo == TipoLancamento.Receita).Sum(l => l.Valor),
                g.Where(l => l.Tipo == TipoLancamento.Despesa).Sum(l => l.Valor)))
            .OrderBy(m => m.Mes)
            .ToList();

        return new BalancoReadModel(
            ano,
            mes,
            totalReceitas,
            totalDespesasPagas,
            totalDespesasPendentes,
            saldo,
            porCategoria,
            porMes);
    }

    public async Task<string?> ObterAnexoAsync(Guid id, Guid usuarioId, CancellationToken ct)
        => await _db.Lancamentos.AsNoTracking()
            .Where(l => l.Id == id && l.UsuarioId == usuarioId)
            .Select(l => l.AnexoBoleto)
            .FirstOrDefaultAsync(ct);
}
