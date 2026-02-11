using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartEcoWaste.Data.Dtos
{
    public class VerifyBinDto
    {
        public int CollecterId { get; set; }
        public int BinId { get; set; }
        public int UserId { get; set; }
    }
}
