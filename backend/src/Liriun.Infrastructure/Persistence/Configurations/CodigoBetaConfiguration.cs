using Liriun.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Liriun.Infrastructure.Persistence.Configurations;

public class CodigoBetaConfiguration : IEntityTypeConfiguration<CodigoBetaModel>
{
    public void Configure(EntityTypeBuilder<CodigoBetaModel> builder)
    {
        builder.ToTable("codigos_beta");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id).HasColumnName("id");
        builder.Property(c => c.Codigo).HasColumnName("codigo").HasMaxLength(40).IsRequired();
        builder.Property(c => c.CriadoPorUsuarioId).HasColumnName("criado_por_usuario_id").IsRequired();
        builder.Property(c => c.CriadoEm).HasColumnName("criado_em").IsRequired();
        builder.Property(c => c.UsadoPorUsuarioId).HasColumnName("usado_por_usuario_id");
        builder.Property(c => c.UsadoEm).HasColumnName("usado_em");
        builder.Property(c => c.RevogadoEm).HasColumnName("revogado_em");
        builder.Property(c => c.ExpiraEm).HasColumnName("expira_em");

        builder.HasIndex(c => c.Codigo).IsUnique();

        builder.HasOne<UsuarioModel>()
            .WithMany()
            .HasForeignKey(c => c.CriadoPorUsuarioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<UsuarioModel>()
            .WithMany()
            .HasForeignKey(c => c.UsadoPorUsuarioId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
