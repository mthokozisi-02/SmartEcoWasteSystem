using System.Collections.Generic;

namespace SmartEcoWaste.Data.Entities
{
    public class Building : BaseEntity, IMustHaveTenant
    {
        public int TenantId { get; set; }
        public int PropertyId { get; set; }
        public string Name { get; set; } = null!; // E.g., "Main Retail Center", "Block C", "Food Court Wing"
        public string? Code { get; set; }
        public int NumberOfFloors { get; set; } = 1;

        public Property? Property { get; set; }
        public ICollection<WasteZone> WasteZones { get; set; } = new List<WasteZone>();
    }
}
