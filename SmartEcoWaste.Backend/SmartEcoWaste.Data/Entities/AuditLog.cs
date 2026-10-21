using SmartEcoWaste.Data.Entities;
using System;

namespace SmartEcoWaste.Data.Entities
{
    public class AuditLog : BaseEntity, IMustHaveTenant
    {
        public int TenantId { get; set; }
        public int? UserId { get; set; }
        public string? UserEmail { get; set; }
        public string Action { get; set; } = string.Empty; // e.g. "AssignRole", "ApproveAnomaly", "CreateTask", "UpdateStatus"
        public string EntityType { get; set; } = string.Empty; // e.g. "User", "BinInspectionLog", "CollectionTask", "Bin"
        public int? EntityId { get; set; }
        public string? Details { get; set; }
        public string? IpAddress { get; set; }

        public Tenant? Tenant { get; set; }
        public User? User { get; set; }
    }
}
