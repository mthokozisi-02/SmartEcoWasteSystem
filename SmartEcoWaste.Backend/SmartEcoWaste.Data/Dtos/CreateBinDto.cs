using SmartEcoWaste.Data.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartEcoWaste.Data.Dtos
{
    public class CreateBinDto
    {
        public int Id { get; set; }
        public int? WasteZoneId { get; set; }
        public string? BinTag { get; set; }
        public WasteCategory Category { get; set; } = WasteCategory.GeneralWaste;
        public double CapacityLiters { get; set; } = 240.0;
        public string? Area { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string Url { get; set; } = string.Empty;
    }
}
