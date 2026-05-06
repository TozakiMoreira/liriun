using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Liriun.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarLancamentos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "lancamentos",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    usuario_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tipo = table.Column<short>(type: "smallint", nullable: false),
                    descricao = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    valor = table.Column<decimal>(type: "numeric(14,2)", nullable: false),
                    data_referencia = table.Column<DateTime>(type: "date", nullable: false),
                    categoria = table.Column<short>(type: "smallint", nullable: false),
                    status = table.Column<short>(type: "smallint", nullable: false),
                    recorrencia = table.Column<short>(type: "smallint", nullable: false),
                    anexo_boleto = table.Column<string>(type: "text", nullable: true),
                    observacoes = table.Column<string>(type: "text", nullable: true),
                    criado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    pago_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "lancamentos");
        }
    }
}
