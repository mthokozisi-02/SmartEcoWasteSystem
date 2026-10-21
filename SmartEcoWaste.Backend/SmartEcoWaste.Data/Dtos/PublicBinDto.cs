using SmartEcoWaste.Data.Enums;
using System;

namespace SmartEcoWaste.Data.Dtos
{
    public class PublicBinDto
    {
        public int Id { get; set; }
        public string BinTag { get; set; } = string.Empty;
        public string? Area { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public Status Status { get; set; }
        public WasteCategory Category { get; set; }
    }
}
