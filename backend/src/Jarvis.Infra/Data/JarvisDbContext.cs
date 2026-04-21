using Jarvis.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Jarvis.Infra.Data;

public class JarvisDbContext : DbContext
{
    public JarvisDbContext(DbContextOptions<JarvisDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Prazo> Prazos => Set<Prazo>();
    public DbSet<Tarefa> Tarefas => Set<Tarefa>();
    public DbSet<TarefaCategoria> TarefasCategorias => Set<TarefaCategoria>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(JarvisDbContext).Assembly);
    }
}
