using SmartEcoWaste.Data.Enums;
using System;
using System.Collections.Generic;

namespace SmartEcoWaste.Data.Entities
{
    public class CollectionTask : BaseEntity, IMustHaveTenant
    {
        public int TenantId { get; set; }
        public int BinId { get; set; }
        public int? AssignedUserId { get; set; } // Staff member or contractor
        public string? ContractorName { get; set; } // Organization or third-party contractor name
        public string Title { get; set; } = null!;
        public string? Instructions { get; set; }
        public CollectionTaskStatus Status { get; set; } = CollectionTaskStatus.Pending;

        public DateTime ScheduledAt { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime DueDate { get; set; }

        public Tenant? Tenant { get; set; }
        public Bin? Bin { get; set; }
        public User? AssignedUser { get; set; }
        public ICollection<BinInspectionLog> InspectionLogs { get; set; } = new List<BinInspectionLog>();
    }
}
