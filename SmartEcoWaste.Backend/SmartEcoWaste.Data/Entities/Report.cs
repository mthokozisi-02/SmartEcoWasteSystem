using SmartEcoWaste.Data.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace SmartEcoWaste.Data.Entities
{
    public class Report : BaseEntity, IMustHaveTenant
    {
        public int TenantId { get; set; }
        public int BinId { get; set; }
        public int? UserId { get; set; } // Nullable: supports anonymous (public citizen) reports
        public ReportStatus Status { get; set; } = ReportStatus.Submitted;
        public string? RejectionReason { get; set; }
        public DateTime? VerifiedAt { get; set; }
        public int? VerifiedBy { get; set; }

        public Tenant? Tenant { get; set; }
        public Bin? Bin { get; set; }
        public User? User { get; set; }
        public User? VerifyByUser { get; set; }
    }
}
