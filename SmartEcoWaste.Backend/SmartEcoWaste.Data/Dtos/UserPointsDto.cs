using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartEcoWaste.Data.Dtos
{
    public class UserPointsDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int Points { get; set; }
    }
}
