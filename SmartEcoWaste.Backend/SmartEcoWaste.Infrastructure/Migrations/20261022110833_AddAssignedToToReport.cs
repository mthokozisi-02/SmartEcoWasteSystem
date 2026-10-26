using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartEcoWaste.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAssignedToToReport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Reports' AND COLUMN_NAME = 'AssignedTo');
                SET @sql = IF(@col_exists = 0, 'ALTER TABLE `Reports` ADD `AssignedTo` int NULL', 'SELECT 1');
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;

                SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Reports' AND INDEX_NAME = 'IX_Reports_AssignedTo');
                SET @sql = IF(@idx_exists = 0, 'CREATE INDEX `IX_Reports_AssignedTo` ON `Reports` (`AssignedTo`)', 'SELECT 1');
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;

                SET @fk_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Reports' AND CONSTRAINT_NAME = 'FK_Reports_Users_AssignedTo');
                SET @sql = IF(@fk_exists = 0, 'ALTER TABLE `Reports` ADD CONSTRAINT `FK_Reports_Users_AssignedTo` FOREIGN KEY (`AssignedTo`) REFERENCES `Users` (`Id`) ON DELETE SET NULL', 'SELECT 1');
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;

                INSERT INTO `Roles` (`Id`, `Name`, `CreatedAt`, `IsDeleted`) 
                SELECT 3, 'Staff', UTC_TIMESTAMP(), 0 
                WHERE NOT EXISTS (SELECT 1 FROM `Roles` WHERE `Name` = 'Staff' OR `Id` = 3);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reports_Users_AssignedTo",
                table: "Reports");

            migrationBuilder.DropIndex(
                name: "IX_Reports_AssignedTo",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "AssignedTo",
                table: "Reports");
        }
    }
}
