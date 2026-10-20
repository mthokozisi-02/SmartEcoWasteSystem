using System;

namespace SmartEcoWaste.Data.Dtos
{
    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string? TenantCode { get; set; }
        public int? TenantId { get; set; }
    }
}