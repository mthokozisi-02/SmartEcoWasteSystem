using SmartEcoWaste.Data.Enums;
using System;

namespace SmartEcoWaste.Data.Entities
{
    public class BinInspectionLog : BaseEntity, IMustHaveTenant
    {
        public int TenantId { get; set; }
        public int BinId { get; set; }
        public int? CollectionTaskId { get; set; }
        public int InspectorUserId { get; set; }

        public bool QrCodeScanned { get; set; } = true;
        public int FillLevelPercentage { get; set; } // 0 - 100%
        public double? MeasuredWeightKg { get; set; } // For commercial weight & cost calculation
        public InspectionCondition Condition { get; set; } = InspectionCondition.NormalClean;

        public string? PhotoProofUrl { get; set; }
        public string? Notes { get; set; }

        // Exceptions & Approvals
        public bool HasAnomaly { get; set; } = false;
        public string? AnomalyReason { get; set; }
        public bool IsApproved { get; set; } = true;
        public int? ApprovedByUserId { get; set; }
        public DateTime? ApprovedAt { get; set; }

        public Tenant? Tenant { get; set; }
        public Bin? Bin { get; set; }
        public CollectionTask? CollectionTask { get; set; }
        public User? InspectorUser { get; set; }
        public User? ApprovedByUser { get; set; }
    }
}
