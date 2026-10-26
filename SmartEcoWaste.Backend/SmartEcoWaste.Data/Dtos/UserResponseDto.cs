using SmartEcoWaste.Data.Entities;
using System;
using System.Collections.Generic;

namespace SmartEcoWaste.Data.Dtos
{
    public class UserResponseDto
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public string? TenantName { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int Reports { get; set; }
        public int RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public Role Role { get; set; } = null!;
        public int UserPoints { get; set; }

        public ICollection<ReportDto>? UserReports { get; set; }
        public ICollection<UserPointsDto>? Points { get; set; }
    }
}
