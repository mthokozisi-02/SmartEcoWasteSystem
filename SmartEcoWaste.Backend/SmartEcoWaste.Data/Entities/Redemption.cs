using System;
using System.Collections.Generic;
using System.Text;

namespace SmartEcoWaste.Data.Entities
{
    public class Redemption : BaseEntity, IMustHaveTenant
    {
        public int TenantId { get; set; }
        public int UserId { get; set; }
        public int ShopId { get; set; }
        public int PointsUsed { get; set; }

        public Tenant? Tenant { get; set; }
        public User? User { get; set; }
    }
}
