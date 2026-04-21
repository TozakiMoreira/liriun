using Jarvis.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Jarvis.Infra.Data.Configurations;

public class CategoriaConfiguration : IEntityTypeConfiguration<Categoria>
{
    public void Configure(EntityTypeBuilder<Categoria> builder)
    {
        builder.ToTable("categorias");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id).HasColumnName("id");
        builder.Property(c => c.UsuarioId).HasColumnName("usuario_id").IsRequired();
        builder.Property(c => c.Nome).HasColumnName("nome").HasMaxLength(50).IsRequired();
        builder.Property(c => c.CriadaEm).HasColumnName("criada_em").IsRequired();

        builder.HasOne<Usuario>()
            .WithMany()
            .HasForeignKey(c => c.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(c => new { c.UsuarioId, c.Nome }).IsUnique();
    }
}
