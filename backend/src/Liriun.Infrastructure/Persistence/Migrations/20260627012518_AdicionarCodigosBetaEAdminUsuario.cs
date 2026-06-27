using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Liriun.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarCodigosBetaEAdminUsuario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "eh_admin",
                table: "usuarios",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "codigos_beta",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    codigo = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    criado_por_usuario_id = table.Column<Guid>(type: "uuid", nullable: false),
                    criado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    usado_por_usuario_id = table.Column<Guid>(type: "uuid", nullable: true),
                    usado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    revogado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    expira_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_codigos_beta", x => x.id);
                    table.ForeignKey(
                        name: "FK_codigos_beta_usuarios_criado_por_usuario_id",
                        column: x => x.criado_por_usuario_id,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_codigos_beta_usuarios_usado_por_usuario_id",
                        column: x => x.usado_por_usuario_id,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_codigos_beta_codigo",
                table: "codigos_beta",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_codigos_beta_criado_por_usuario_id",
                table: "codigos_beta",
                column: "criado_por_usuario_id");

            migrationBuilder.CreateIndex(
                name: "IX_codigos_beta_usado_por_usuario_id",
                table: "codigos_beta",
                column: "usado_por_usuario_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "codigos_beta");

            migrationBuilder.DropColumn(
                name: "eh_admin",
                table: "usuarios");
        }
    }
}
