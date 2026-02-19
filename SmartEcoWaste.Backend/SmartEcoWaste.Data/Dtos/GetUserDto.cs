using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartEcoWaste.Data.Dtos
{
    public class GetUserDto
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public int Reports { get; set; }
        public int Points { get; set; }
    }
}
