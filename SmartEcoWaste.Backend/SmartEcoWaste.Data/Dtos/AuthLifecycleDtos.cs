namespace SmartEcoWaste.Data.Dtos
{
    public class VerifyEmailDto
    {
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
    }

    public class ForgotPasswordDto
    {
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordWithTokenDto
    {
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class PendingUserDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int TenantId { get; set; }
        public string TenantName { get; set; } = string.Empty;
        public bool IsEmailConfirmed { get; set; }
        public bool IsApproved { get; set; }
        public System.DateTime CreatedAt { get; set; }
    }
}
