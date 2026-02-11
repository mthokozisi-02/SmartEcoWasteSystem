using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartEcoWaste.Data.Dtos
{
    public class CreateBinDto
    {
        public string? Area { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}
