using Liriun.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace Liriun.Infrastructure.Persistence;

public class LiriunDbContext : DbContext
{
    public LiriunDbContext(DbContextOptions<LiriunDbContext> options) : base(options) { }

    public DbSet<UsuarioModel> Usuarios => Set<UsuarioModel>();
    public DbSet<CategoriaModel> Categorias => Set<CategoriaModel>();
    public DbSet<TarefaModel> Tarefas => Set<TarefaModel>();
    public DbSet<TarefaCategoriaModel> TarefasCategorias => Set<TarefaCategoriaModel>();
    public DbSet<LancamentoModel> Lancamentos => Set<LancamentoModel>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(LiriunDbContext).Assembly);
    }
}
