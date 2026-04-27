using Jarvis.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Jarvis.Infrastructure.Persistence.Configurations;

public class CategoriaConfiguration : IEntityTypeConfiguration<CategoriaModel>
{
    public void Configure(EntityTypeBuilder<CategoriaModel> builder)
    {
        builder.ToTable("categorias");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id).HasColumnName("id");
        builder.Property(c => c.UsuarioId).HasColumnName("usuario_id").IsRequired();
        builder.Property(c => c.Nome).HasColumnName("nome").HasMaxLength(50).IsRequired();
        builder.Property(c => c.CriadaEm).HasColumnName("criada_em").IsRequired();

        builder.HasOne<UsuarioModel>()
            .WithMany()
            .HasForeignKey(c => c.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(c => new { c.UsuarioId, c.Nome }).IsUnique();
    }
}
