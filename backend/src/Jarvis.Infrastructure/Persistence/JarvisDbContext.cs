using Jarvis.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace Jarvis.Infrastructure.Persistence;

public class JarvisDbContext : DbContext
{
    public JarvisDbContext(DbContextOptions<JarvisDbContext> options) : base(options) { }

    public DbSet<UsuarioModel> Usuarios => Set<UsuarioModel>();
    public DbSet<CategoriaModel> Categorias => Set<CategoriaModel>();
    public DbSet<TarefaModel> Tarefas => Set<TarefaModel>();
    public DbSet<TarefaCategoriaModel> TarefasCategorias => Set<TarefaCategoriaModel>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(JarvisDbContext).Assembly);
    }
}
