using SmartEcoWaste.Data.Enums;
using System.Collections.Generic;

namespace SmartEcoWaste.Data.Entities
{
    public class Property : BaseEntity, IMustHaveTenant
    {
        public int TenantId { get; set; }
        public string Name { get; set; } = null!;
        public string Code { get; set; } = null!; // E.g., "MALL-NORTH", "ESTATE-PHASE1"
        public PropertyType Type { get; set; } = PropertyType.CommercialMall;
        public string? Address { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        public Tenant? Tenant { get; set; }
        public ICollection<Building> Buildings { get; set; } = new List<Building>();
        public ICollection<WasteZone> WasteZones { get; set; } = new List<WasteZone>();
    }
}
