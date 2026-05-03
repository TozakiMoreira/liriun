using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Liriun.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarFotoPerfilUsuario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "foto_url",
                table: "usuarios",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "foto_url",
                table: "usuarios");
        }
    }
}
