using Jarvis.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Jarvis.Infra.Data.Configurations;

public class TarefaCategoriaConfiguration : IEntityTypeConfiguration<TarefaCategoria>
{
    public void Configure(EntityTypeBuilder<TarefaCategoria> builder)
    {
        builder.ToTable("tarefas_categorias");

        builder.HasKey(tc => new { tc.TarefaId, tc.CategoriaId });

        builder.Property(tc => tc.TarefaId).HasColumnName("tarefa_id");
        builder.Property(tc => tc.CategoriaId).HasColumnName("categoria_id");

        builder.HasOne(tc => tc.Categoria)
            .WithMany(c => c.Tarefas)
            .HasForeignKey(tc => tc.CategoriaId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
