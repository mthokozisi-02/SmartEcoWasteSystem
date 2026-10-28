using System;
using System.Collections.Generic;
using System.Linq;

namespace SmartEcoWaste.Services.Helpers
{
    public static class PasswordPolicyHelper
    {
        private static readonly HashSet<string> CommonWeakPasswords = new(StringComparer.OrdinalIgnoreCase)
        {
            "Password1234!",
            "Admin1234567!",
            "SmartEco1234!",
            "SmartEcoWaste1!",
            "ChangeMe1234!",
            "Welcome12345!",
            "P@ssword1234!",
            "Commercial123!"
        };

        public static (bool IsValid, string? ErrorMessage) ValidatePassword(string? password, string? userEmail = null, string? userName = null)
        {
            if (string.IsNullOrWhiteSpace(password))
            {
                return (false, "Password cannot be empty.");
            }

            if (password.Length < 12)
            {
                return (false, "Password must be at least 12 characters in length.");
            }

            if (!password.Any(char.IsUpper))
            {
                return (false, "Password must contain at least one uppercase letter (A-Z).");
            }

            if (!password.Any(char.IsLower))
            {
                return (false, "Password must contain at least one lowercase letter (a-z).");
            }

            if (!password.Any(char.IsDigit))
            {
                return (false, "Password must contain at least one numerical digit (0-9).");
            }

            if (!password.Any(ch => !char.IsLetterOrDigit(ch)))
            {
                return (false, "Password must contain at least one special character (e.g., !@#$%^&*).");
            }

            if (CommonWeakPasswords.Contains(password.Trim()))
            {
                return (false, "The chosen password is too common and has appeared in known data breaches. Please choose a stronger password.");
            }

            if (!string.IsNullOrWhiteSpace(userEmail) && password.Contains(userEmail.Split('@')[0], StringComparison.OrdinalIgnoreCase))
            {
                return (false, "Password must not contain parts of your email address.");
            }

            if (!string.IsNullOrWhiteSpace(userName) && userName.Length >= 4 && password.Contains(userName, StringComparison.OrdinalIgnoreCase))
            {
                return (false, "Password must not contain your name.");
            }

            return (true, null);
        }
    }
}
