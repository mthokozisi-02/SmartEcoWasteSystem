using SmartEcoWaste.Data.Enums;
using System;
using System.Collections.Generic;

namespace SmartEcoWaste.Data.Entities
{
    public class Bin : BaseEntity, IMustHaveTenant
    {
        public int TenantId { get; set; }
        public int? WasteZoneId { get; set; }
        public string BinTag { get; set; } = string.Empty; // Human-friendly tag e.g. "BIN-FC-01"
        public WasteCategory Category { get; set; } = WasteCategory.GeneralWaste;
        public double CapacityLiters { get; set; } = 240.0;
        public string? Area { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string QrCodeUrl { get; set; } = string.Empty;
        public Status Status { get; set; } = Status.Emptied;

        public Tenant? Tenant { get; set; }
        public WasteZone? WasteZone { get; set; }
        public ICollection<CollectionTask> Tasks { get; set; } = new List<CollectionTask>();
        public ICollection<BinInspectionLog> InspectionLogs { get; set; } = new List<BinInspectionLog>();
    }
}
