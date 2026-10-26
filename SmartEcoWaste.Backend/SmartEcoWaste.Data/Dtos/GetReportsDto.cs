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
        public int Id { get; set; }
        public int BinId { get; set; }
        public string BinArea { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public ReportStatus Status { get; set; } = ReportStatus.Submitted;
        public DateTime? VerifiedAt { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string? VerifiedBy { get; set; }
        public string? PhotoUrl { get; set; }
        public int? AssignedTo { get; set; }
        public string? AssignedUserName { get; set; }
    }
}
