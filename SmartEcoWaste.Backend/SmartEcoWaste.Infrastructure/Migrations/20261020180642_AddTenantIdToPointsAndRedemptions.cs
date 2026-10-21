using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartEcoWaste.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantIdToPointsAndRedemptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TenantId",
                table: "UsersPoints",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TenantId",
                table: "Redemptions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_UsersPoints_TenantId",
                table: "UsersPoints",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Redemptions_TenantId",
                table: "Redemptions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Redemptions_UserId",
                table: "Redemptions",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Redemptions_Tenants_TenantId",
                table: "Redemptions",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Redemptions_Users_UserId",
                table: "Redemptions",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UsersPoints_Tenants_TenantId",
                table: "UsersPoints",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Redemptions_Tenants_TenantId",
                table: "Redemptions");

            migrationBuilder.DropForeignKey(
                name: "FK_Redemptions_Users_UserId",
                table: "Redemptions");

            migrationBuilder.DropForeignKey(
                name: "FK_UsersPoints_Tenants_TenantId",
                table: "UsersPoints");

            migrationBuilder.DropIndex(
                name: "IX_UsersPoints_TenantId",
                table: "UsersPoints");

            migrationBuilder.DropIndex(
                name: "IX_Redemptions_TenantId",
                table: "Redemptions");

            migrationBuilder.DropIndex(
                name: "IX_Redemptions_UserId",
                table: "Redemptions");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "UsersPoints");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Redemptions");
        }
    }
}
