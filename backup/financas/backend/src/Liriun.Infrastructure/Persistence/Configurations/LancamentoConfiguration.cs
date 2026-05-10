using Liriun.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Liriun.Infrastructure.Persistence.Configurations;

public class LancamentoConfiguration : IEntityTypeConfiguration<LancamentoModel>
{
    public void Configure(EntityTypeBuilder<LancamentoModel> builder)
    {
        builder.ToTable("lancamentos");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.Id).HasColumnName("id");
        builder.Property(l => l.UsuarioId).HasColumnName("usuario_id").IsRequired();
        builder.Property(l => l.Tipo).HasColumnName("tipo").HasConversion<short>().IsRequired();
        builder.Property(l => l.Descricao).HasColumnName("descricao").HasMaxLength(200).IsRequired();
        builder.Property(l => l.Valor).HasColumnName("valor").HasColumnType("numeric(14,2)").IsRequired();
        builder.Property(l => l.DataReferencia).HasColumnName("data_referencia").HasColumnType("date").IsRequired();
        builder.Property(l => l.Categoria).HasColumnName("categoria").HasConversion<short>().IsRequired();
        builder.Property(l => l.Status).HasColumnName("status").HasConversion<short>().IsRequired();
        builder.Property(l => l.Recorrencia).HasColumnName("recorrencia").HasConversion<short>().IsRequired();
        builder.Property(l => l.AnexoBoleto).HasColumnName("anexo_boleto").HasColumnType("text");
        builder.Property(l => l.Observacoes).HasColumnName("observacoes").HasColumnType("text");
        builder.Property(l => l.CriadoEm).HasColumnName("criado_em").IsRequired();
        builder.Property(l => l.PagoEm).HasColumnName("pago_em");

        builder.HasOne<UsuarioModel>()
            .WithMany()
            .HasForeignKey(l => l.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(l => new { l.UsuarioId, l.DataReferencia });
        builder.HasIndex(l => new { l.UsuarioId, l.Tipo, l.Status });
    }
}
