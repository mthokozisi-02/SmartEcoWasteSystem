using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartEcoWaste.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class verifiedBy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "VerifiedBy",
                table: "Reports",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "VerifiedBy",
                table: "Reports");
        }
    }
}
