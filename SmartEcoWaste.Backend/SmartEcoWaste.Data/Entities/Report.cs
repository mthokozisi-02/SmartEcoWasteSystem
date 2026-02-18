using SmartEcoWaste.Data.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace SmartEcoWaste.Data.Entities
{
    public class Report : BaseEntity
    {
        public int BinId { get; set; }
        public int UserId { get; set; }
        public Status Status { get; set; } = Status.Full;
        public DateTime? VerifiedAt { get; set; }
        public int? VerifiedBy { get; set; }

        public Bin? Bin { get; set; }
        public User? User { get; set; }
        public User? VerifyByUser { get; set; }
    }
}
