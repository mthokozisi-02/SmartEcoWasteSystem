using System;

namespace SmartEcoWaste.Data.Dtos
{
    public class UserPointsDto
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public int UserId { get; set; }
        public int Points { get; set; }
    }
}
