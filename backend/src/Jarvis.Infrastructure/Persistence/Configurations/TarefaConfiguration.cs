using Jarvis.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Jarvis.Infrastructure.Persistence.Configurations;

public class TarefaConfiguration : IEntityTypeConfiguration<TarefaModel>
{
    public void Configure(EntityTypeBuilder<TarefaModel> builder)
    {
        builder.ToTable("tarefas");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Id).HasColumnName("id");
        builder.Property(t => t.UsuarioId).HasColumnName("usuario_id").IsRequired();
        builder.Property(t => t.Nome).HasColumnName("nome").HasMaxLength(200).IsRequired();
        builder.Property(t => t.PrazoId).HasColumnName("prazo_id");
        builder.Property(t => t.DataPrazo).HasColumnName("data_prazo").HasColumnType("date");
        builder.Property(t => t.HorarioFinal).HasColumnName("horario_final").HasColumnType("time").IsRequired();
        builder.Property(t => t.Prioridade).HasColumnName("prioridade").HasConversion<short>().IsRequired();
        builder.Property(t => t.Status).HasColumnName("status").HasConversion<short>().IsRequired();
        builder.Property(t => t.CriadaEm).HasColumnName("criada_em").IsRequired();
        builder.Property(t => t.ConcluidaEm).HasColumnName("concluida_em");

        builder.HasOne<UsuarioModel>()
            .WithMany()
            .HasForeignKey(t => t.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<PrazoModel>()
            .WithMany()
            .HasForeignKey(t => t.PrazoId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(t => t.Categorias)
            .WithOne(tc => tc.Tarefa)
            .HasForeignKey(tc => tc.TarefaId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(t => new { t.UsuarioId, t.Status });
        builder.HasIndex(t => new { t.UsuarioId, t.DataPrazo });
    }
}
