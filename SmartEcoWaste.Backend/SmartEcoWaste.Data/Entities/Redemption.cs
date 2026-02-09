using System;
using System.Collections.Generic;
using System.Text;

namespace SmartEcoWaste.Data.Entities
{
    public class Redemption : BaseEntity
    {
        public int UserId { get; set; }
        public int ShopId { get; set; }
        public int PointsUsed { get; set; }

    }
}
