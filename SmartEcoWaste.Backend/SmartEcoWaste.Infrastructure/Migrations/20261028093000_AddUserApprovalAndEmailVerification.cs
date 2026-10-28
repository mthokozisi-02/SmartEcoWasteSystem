using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartEcoWaste.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserApprovalAndEmailVerification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                -- Add IsApproved column if not exists
                SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Users' AND COLUMN_NAME = 'IsApproved');
                SET @sql = IF(@col_exists = 0, 'ALTER TABLE `Users` ADD `IsApproved` tinyint(1) NOT NULL DEFAULT 0', 'SELECT 1');
                PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

                -- Add ApprovedAt column if not exists
                SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Users' AND COLUMN_NAME = 'ApprovedAt');
                SET @sql = IF(@col_exists = 0, 'ALTER TABLE `Users` ADD `ApprovedAt` datetime(6) NULL', 'SELECT 1');
                PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

                -- Add ApprovedByUserId column if not exists
                SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Users' AND COLUMN_NAME = 'ApprovedByUserId');
                SET @sql = IF(@col_exists = 0, 'ALTER TABLE `Users` ADD `ApprovedByUserId` int NULL', 'SELECT 1');
                PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

                -- Add EmailConfirmationToken column if not exists
                SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Users' AND COLUMN_NAME = 'EmailConfirmationToken');
                SET @sql = IF(@col_exists = 0, 'ALTER TABLE `Users` ADD `EmailConfirmationToken` varchar(255) NULL', 'SELECT 1');
                PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

                -- Add EmailConfirmationTokenExpiry column if not exists
                SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Users' AND COLUMN_NAME = 'EmailConfirmationTokenExpiry');
                SET @sql = IF(@col_exists = 0, 'ALTER TABLE `Users` ADD `EmailConfirmationTokenExpiry` datetime(6) NULL', 'SELECT 1');
                PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

                -- Add PasswordResetToken column if not exists
                SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Users' AND COLUMN_NAME = 'PasswordResetToken');
                SET @sql = IF(@col_exists = 0, 'ALTER TABLE `Users` ADD `PasswordResetToken` varchar(255) NULL', 'SELECT 1');
                PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

                -- Add PasswordResetTokenExpiry column if not exists
                SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Users' AND COLUMN_NAME = 'PasswordResetTokenExpiry');
                SET @sql = IF(@col_exists = 0, 'ALTER TABLE `Users` ADD `PasswordResetTokenExpiry` datetime(6) NULL', 'SELECT 1');
                PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

                -- Add RejectionReason column to Reports if not exists
                SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Reports' AND COLUMN_NAME = 'RejectionReason');
                SET @sql = IF(@col_exists = 0, 'ALTER TABLE `Reports` ADD `RejectionReason` longtext NULL', 'SELECT 1');
                PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

                -- Ensure all pre-existing active users are confirmed and approved
                UPDATE `Users` SET `IsApproved` = 1, `IsEmailConfirmed` = 1 WHERE `IsDeleted` = 0;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "IsApproved", table: "Users");
            migrationBuilder.DropColumn(name: "ApprovedAt", table: "Users");
            migrationBuilder.DropColumn(name: "ApprovedByUserId", table: "Users");
            migrationBuilder.DropColumn(name: "EmailConfirmationToken", table: "Users");
            migrationBuilder.DropColumn(name: "EmailConfirmationTokenExpiry", table: "Users");
            migrationBuilder.DropColumn(name: "PasswordResetToken", table: "Users");
            migrationBuilder.DropColumn(name: "PasswordResetTokenExpiry", table: "Users");
        }
    }
}
