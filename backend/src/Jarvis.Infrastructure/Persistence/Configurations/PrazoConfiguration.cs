using Jarvis.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Jarvis.Infrastructure.Persistence.Configurations;

public class PrazoConfiguration : IEntityTypeConfiguration<PrazoModel>
{
    public void Configure(EntityTypeBuilder<PrazoModel> builder)
    {
        builder.ToTable("prazos");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Id).HasColumnName("id");
        builder.Property(p => p.UsuarioId).HasColumnName("usuario_id").IsRequired();
        builder.Property(p => p.Nome).HasColumnName("nome").HasMaxLength(50).IsRequired();
        builder.Property(p => p.DuracaoDias).HasColumnName("duracao_dias");
        builder.Property(p => p.CriadoEm).HasColumnName("criado_em").IsRequired();

        builder.HasOne<UsuarioModel>()
            .WithMany()
            .HasForeignKey(p => p.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(p => new { p.UsuarioId, p.Nome }).IsUnique();
    }
}
