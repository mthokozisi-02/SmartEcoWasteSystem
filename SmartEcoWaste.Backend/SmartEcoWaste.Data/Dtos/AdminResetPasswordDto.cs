using System;

namespace SmartEcoWaste.Data.Dtos
{
    public class AdminResetPasswordDto
    {
        public int TargetUserId { get; set; }
        public string NewPassword { get; set; } = string.Empty;
    }
}
