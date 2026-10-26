namespace SmartEcoWaste.Data.Dtos
{
    public class TokenResponseDto
    {
        public required string AccessToken { get; set; }
        public required string RefreshToken { get; set; }
        public int ExpiresIn { get; set; }
        /// <summary>
        /// Returned explicitly so the client never needs to decode the JWT or
        /// read user ID from localStorage via a separate decode step.
        /// </summary>
        public int UserId { get; set; }
        public int TenantId { get; set; }
        public string? TenantName { get; set; }
        public string? TenantCode { get; set; }
        public string? OrganizationType { get; set; }
        public string? Role { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
    }
}
