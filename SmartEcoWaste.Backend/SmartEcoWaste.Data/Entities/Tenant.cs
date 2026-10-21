using System;
using System.Collections.Generic;

namespace SmartEcoWaste.Data.Entities
{
    public class Tenant : BaseEntity
    {
        public string Name { get; set; } = null!;
        public string Code { get; set; } = null!; // Unique slug e.g. "MALL-001", "RES-001"
        public string? OrganizationType { get; set; } // "ResidentialEstate", "CommercialMall", "Municipality"
        public bool IsActive { get; set; } = true;

        public ICollection<User> Users { get; set; } = new List<User>();
        public ICollection<Property> Properties { get; set; } = new List<Property>();
        public ICollection<WasteZone> WasteZones { get; set; } = new List<WasteZone>();
        public ICollection<Bin> Bins { get; set; } = new List<Bin>();
        public ICollection<Report> Reports { get; set; } = new List<Report>();
        public ICollection<CollectionTask> Tasks { get; set; } = new List<CollectionTask>();
        public ICollection<BinInspectionLog> InspectionLogs { get; set; } = new List<BinInspectionLog>();
        public ICollection<UserPoints> UserPoints { get; set; } = new List<UserPoints>();
        public ICollection<Redemption> Redemptions { get; set; } = new List<Redemption>();
    }
}
