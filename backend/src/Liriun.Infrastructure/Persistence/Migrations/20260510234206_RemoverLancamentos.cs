using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Liriun.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoverLancamentos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "lancamentos");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "lancamentos",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    anexo_boleto = table.Column<string>(type: "text", nullable: true),
                    categoria = table.Column<short>(type: "smallint", nullable: false),
                    criado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    data_referencia = table.Column<DateTime>(type: "date", nullable: false),
                    descricao = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    observacoes = table.Column<string>(type: "text", nullable: true),
                    pago_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    recorrencia = table.Column<short>(type: "smallint", nullable: false),
                    status = table.Column<short>(type: "smallint", nullable: false),
                    tipo = table.Column<short>(type: "smallint", nullable: false),
                    usuario_id = table.Column<Guid>(type: "uuid", nullable: false),
                    valor = table.Column<decimal>(type: "numeric(14,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_lancamentos", x => x.id);
                    table.ForeignKey(
                        name: "FK_lancamentos_usuarios_usuario_id",
                        column: x => x.usuario_id,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_lancamentos_usuario_id_data_referencia",
                table: "lancamentos",
                columns: new[] { "usuario_id", "data_referencia" });

            migrationBuilder.CreateIndex(
                name: "IX_lancamentos_usuario_id_tipo_status",
                table: "lancamentos",
                columns: new[] { "usuario_id", "tipo", "status" });
        }
    }
}
