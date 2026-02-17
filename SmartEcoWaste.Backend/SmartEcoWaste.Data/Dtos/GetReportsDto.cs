using SmartEcoWaste.Data.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartEcoWaste.Data.Dtos
{
    public class GetReportsDto
    {
        public int BinId { get; set; }
        public string BinArea { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public Status Status { get; set; } = Status.Full;
        public DateTime? VerifiedAt { get; set; }
        public DateTime? CreatedAt { get; set; }
        public int? VerifiedBy { get; set; }
    }
}
