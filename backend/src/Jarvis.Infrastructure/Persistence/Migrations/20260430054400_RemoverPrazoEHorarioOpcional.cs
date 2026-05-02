using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Jarvis.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoverPrazoEHorarioOpcional : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tarefas_prazos_prazo_id",
                table: "tarefas");

            migrationBuilder.DropTable(
                name: "prazos");

            migrationBuilder.DropIndex(
                name: "IX_tarefas_prazo_id",
                table: "tarefas");

            migrationBuilder.DropColumn(
                name: "prazo_id",
                table: "tarefas");

            migrationBuilder.AlterColumn<TimeSpan>(
                name: "horario_final",
                table: "tarefas",
                type: "time",
                nullable: true,
                oldClrType: typeof(TimeSpan),
                oldType: "time");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<TimeSpan>(
                name: "horario_final",
                table: "tarefas",
                type: "time",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0),
                oldClrType: typeof(TimeSpan),
                oldType: "time",
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "prazo_id",
                table: "tarefas",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "prazos",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    criado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    duracao_dias = table.Column<int>(type: "integer", nullable: true),
                    nome = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    usuario_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_prazos", x => x.id);
                    table.ForeignKey(
                        name: "FK_prazos_usuarios_usuario_id",
                        column: x => x.usuario_id,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_tarefas_prazo_id",
                table: "tarefas",
                column: "prazo_id");

            migrationBuilder.CreateIndex(
                name: "IX_prazos_usuario_id_nome",
                table: "prazos",
                columns: new[] { "usuario_id", "nome" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_tarefas_prazos_prazo_id",
                table: "tarefas",
                column: "prazo_id",
                principalTable: "prazos",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
