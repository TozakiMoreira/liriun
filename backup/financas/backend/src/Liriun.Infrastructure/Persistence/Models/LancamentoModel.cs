using Liriun.Core.Enums;

namespace Liriun.Infrastructure.Persistence.Models;

public class LancamentoModel
{
    public Guid Id { get; set; }
    public Guid UsuarioId { get; set; }
    public TipoLancamento Tipo { get; set; }
    public string Descricao { get; set; } = null!;
    public decimal Valor { get; set; }
    public DateTime DataReferencia { get; set; }
    public CategoriaLancamento Categoria { get; set; }
    public StatusLancamento Status { get; set; }
    public TipoRecorrencia Recorrencia { get; set; }
    public string? AnexoBoleto { get; set; }
    public string? Observacoes { get; set; }
    public DateTime CriadoEm { get; set; }
    public DateTime? PagoEm { get; set; }
}
