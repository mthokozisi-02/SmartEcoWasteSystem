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
        public string? Area { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public Status Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public string QrCodeUrl { get; set; }
        public byte[] QrCode { get; set; }

    }
}
