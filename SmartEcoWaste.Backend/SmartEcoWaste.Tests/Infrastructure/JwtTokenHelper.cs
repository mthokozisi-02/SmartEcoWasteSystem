using Microsoft.IdentityModel.Tokens;
using SmartEcoWaste.Data.Entities;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SmartEcoWaste.Tests.Infrastructure
{
    public static class JwtTokenHelper
    {
        public const string SigningKey = "MySuperSecureAndRandomKeyThatLooksJustAwesomeAndNeedsToBeVeryVeryLong!!!llloneeleven";
        public const string Issuer = "EcoWasteApi";
        public const string Audience = "EcoWasteClient";

        public static string GenerateToken(
            int userId,
            string email,
            int tenantId,
            string role = "Admin",
            string tenantCode = "TEN-A",
            string tenantName = "Tenant Organization",
            bool isSuperAdmin = false)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.Name, email),
                new(ClaimTypes.Email, email),
                new(ClaimTypes.NameIdentifier, userId.ToString()),
                new(ClaimTypes.Role, role),
                new("TenantId", tenantId.ToString()),
                new("TenantCode", tenantCode),
                new("TenantName", tenantName),
                new("OrganizationType", "CommercialMall")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SigningKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var descriptor = new JwtSecurityToken(
                issuer: Issuer,
                audience: Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(descriptor);
        }
    }
}
