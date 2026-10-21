using System;

namespace SmartEcoWaste.Data.Dtos
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public int? TenantId { get; set; }
        public string? TenantCode { get; set; }
    }
}
