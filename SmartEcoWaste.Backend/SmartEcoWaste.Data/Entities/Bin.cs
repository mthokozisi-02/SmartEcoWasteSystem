using SmartEcoWaste.Data.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace SmartEcoWaste.Data.Entities
{
    public class Bin : BaseEntity
    {
        public string? Area { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public Status Status { get; set; } = Status.Emptied;
    }
}
