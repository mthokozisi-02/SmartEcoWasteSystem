using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartEcoWaste.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantUniqueConstraintsForPropertyAndBin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Properties",
                type: "varchar(255)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "BinTag",
                table: "Bins",
                type: "varchar(255)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.Sql("UPDATE `Bins` SET `BinTag` = CONCAT('BIN-', `Id`) WHERE `BinTag` IS NULL OR `BinTag` = '';");
            migrationBuilder.CreateIndex(name: "IX_Bins_TenantId_BinTag",
                table: "Bins",
                columns: new[] { "TenantId", "BinTag" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Properties_TenantId_Code",
                table: "Properties");

            migrationBuilder.DropIndex(
                name: "IX_Bins_TenantId_BinTag",
                table: "Bins");

            migrationBuilder.DropColumn(
                name: "RejectionReason",
                table: "Reports");

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Properties",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "BinTag",
                table: "Bins",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Properties_TenantId",
                table: "Properties",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Bins_TenantId",
                table: "Bins",
                column: "TenantId");
        }
    }
}




