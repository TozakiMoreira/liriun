using Liriun.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Liriun.Infrastructure.Persistence.Configurations;

public class TarefaCategoriaConfiguration : IEntityTypeConfiguration<TarefaCategoriaModel>
{
    public void Configure(EntityTypeBuilder<TarefaCategoriaModel> builder)
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
