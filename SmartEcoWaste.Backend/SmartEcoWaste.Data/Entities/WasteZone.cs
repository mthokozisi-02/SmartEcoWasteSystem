using System.Collections.Generic;

namespace SmartEcoWaste.Data.Entities
{
    public class WasteZone : BaseEntity, IMustHaveTenant
    {
        public int TenantId { get; set; }
        public int PropertyId { get; set; }
        public int? BuildingId { get; set; }
        public string Name { get; set; } = null!; // E.g., "Food Court Waste Station 2", "Level 1 Loading Bay", "Basement Parking B2"
        public string? FloorLevel { get; set; } // E.g., "Ground", "Floor 1", "Basement 2"
        public string? Description { get; set; } // Indoor descriptive location when GPS is unavailable

        public Tenant? Tenant { get; set; }
        public Property? Property { get; set; }
        public Building? Building { get; set; }
        public ICollection<Bin> Bins { get; set; } = new List<Bin>();
    }
}
