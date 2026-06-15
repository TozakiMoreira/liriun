using Liriun.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Liriun.Infrastructure.Persistence.Configurations;

public class UsuarioConfiguration : IEntityTypeConfiguration<UsuarioModel>
{
    public void Configure(EntityTypeBuilder<UsuarioModel> builder)
    {
        builder.ToTable("usuarios");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Id).HasColumnName("id");
        builder.Property(u => u.Nome).HasColumnName("nome").HasMaxLength(100).IsRequired();
        builder.Property(u => u.Email).HasColumnName("email").HasMaxLength(150).IsRequired();
        builder.Property(u => u.SenhaHash).HasColumnName("senha_hash").HasMaxLength(255).IsRequired();
        builder.Property(u => u.FotoUrl).HasColumnName("foto_url").HasColumnType("text");
        builder.Property(u => u.CriadoEm).HasColumnName("criado_em").IsRequired();
        builder.Property(u => u.TermosAceitosEm).HasColumnName("termos_aceitos_em");
        builder.Property(u => u.TimeZoneId).HasColumnName("time_zone_id").HasMaxLength(64).IsRequired().HasDefaultValue("America/Sao_Paulo");

        builder.HasIndex(u => u.Email).IsUnique();
    }
}
