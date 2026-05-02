using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Jarvis.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class TarefaDataPrazoObrigatoriaEObservacoes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Preserva tarefas existentes sem data: atribui hoje pra elas
            // antes de tornar a coluna NOT NULL.
            migrationBuilder.Sql(
                "UPDATE tarefas SET data_prazo = CURRENT_DATE WHERE data_prazo IS NULL;");

            migrationBuilder.AlterColumn<DateTime>(
                name: "data_prazo",
                table: "tarefas",
                type: "date",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "date",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "observacoes",
                table: "tarefas",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "observacoes",
                table: "tarefas");

            migrationBuilder.AlterColumn<DateTime>(
                name: "data_prazo",
                table: "tarefas",
                type: "date",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "date");
        }
    }
}
