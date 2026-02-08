using System;
using System.Collections.Generic;
using System.Text;

namespace SmartEcoWaste.Data.Entities
{
    public class Report : BaseEntity
    {
        public int BinId { get; set; }
        public int UserId { get; set; }
        public string? Status { get; set; }
        public DateTime? VerifiedAt { get; set; }

        public Bin? Bin { get; set; }
    }
}
