using SmartEcoWaste.Data.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartEcoWaste.Data.Dtos
{
    public class BinResponseDto
    {
        public int Id { get; set; }
        public int? WasteZoneId { get; set; }
        public string? WasteZoneName { get; set; }
        public int? BuildingId { get; set; }
        public string? BuildingName { get; set; }
        public int? PropertyId { get; set; }
        public string? PropertyName { get; set; }
        public string BinTag { get; set; } = string.Empty;
        public WasteCategory Category { get; set; } = WasteCategory.GeneralWaste;
        public double CapacityLiters { get; set; } = 240.0;
        public string? Area { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public Status Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public string QrCodeUrl { get; set; } = string.Empty;
        public byte[] QrCode { get; set; } = Array.Empty<byte>();
    }
}
