using System;
using System.Collections.Generic;
using System.Text;

namespace SmartEcoWaste.Data.Entities
{
    public class User : BaseEntity, IMustHaveTenant
    {
        public int TenantId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public int RoleId { get; set; } = 2;
        public bool IsEmailConfirmed { get; set; } = false;
        public string? EmailConfirmationToken { get; set; }
        public DateTime? EmailConfirmationTokenExpiry { get; set; }
        public bool IsApproved { get; set; } = false;
        public DateTime? ApprovedAt { get; set; }
        public int? ApprovedByUserId { get; set; }
        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetTokenExpiry { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }

        public Tenant? Tenant { get; set; }
        public Role Role { get; set; } = null!;
        public ICollection<Report>? UserReports { get; set; }
        public ICollection<UserPoints>? Points { get; set; }
    }
}
