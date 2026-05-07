using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Liriun.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarRecorrenciaQuantidade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<short>(
                name: "recorrencia_quantidade",
                table: "tarefas",
                type: "smallint",
                nullable: false,
                defaultValue: (short)1);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "recorrencia_quantidade",
                table: "tarefas");
        }
    }
}
