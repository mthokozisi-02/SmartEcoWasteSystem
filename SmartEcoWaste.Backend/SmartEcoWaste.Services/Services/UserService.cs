using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Data.Entities;
using SmartEcoWaste.Infrastructure.DbContexts;
using SmartEcoWaste.Infrastructure.MultiTenancy;
using SmartEcoWaste.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace SmartEcoWaste.Services.Services
{
    public class UserService(IMapper mapper, SmartEcoWasteDbContext smartEcoWasteDb, IConfiguration configuration, ITenantContextAccessor tenantAccessor) : IUserService
    {
        private readonly IConfiguration _configuration = configuration;
        private readonly IMapper _mapper = mapper;
        private readonly SmartEcoWasteDbContext _smartEcoWasteDb = smartEcoWasteDb;
        private readonly ITenantContextAccessor _tenantAccessor = tenantAccessor;

        public async Task<ServiceResponse<string>> CreateAsyc(UserDto userDto)
        {
            if (string.IsNullOrWhiteSpace(userDto.Email))
            {
                return ServiceResponse<string>.Fail("Email is required.");
            }

            var emailExists = await _smartEcoWasteDb.Users
                .IgnoreQueryFilters()
                .AnyAsync(u => u.Email.ToLower() == userDto.Email.Trim().ToLower());

            if (emailExists)
            {
                return ServiceResponse<string>.Fail("An account with this email address already exists.");
            }

            // Resolve target tenant securely
            Tenant? targetTenant = null;

            // 1. If caller is an authenticated tenant admin/supervisor (not SuperAdmin), ALWAYS bind to caller's tenant
            if (_tenantAccessor?.Tenant != null && _tenantAccessor.Tenant.TenantId > 0 && !_tenantAccessor.Tenant.IsSuperAdmin)
            {
                targetTenant = await _smartEcoWasteDb.Tenants
                    .FirstOrDefaultAsync(t => t.Id == _tenantAccessor.Tenant.TenantId && t.IsActive && !t.IsDeleted);
            }

            // 2. Otherwise (public registration or SuperAdmin explicitly specifying tenant)
            if (targetTenant == null && !string.IsNullOrWhiteSpace(userDto.TenantCode))
            {
                targetTenant = await _smartEcoWasteDb.Tenants
                    .FirstOrDefaultAsync(t => t.Code == userDto.TenantCode.Trim() && t.IsActive && !t.IsDeleted);

                if (targetTenant == null)
                {
                    return ServiceResponse<string>.Fail("Specified organization code is invalid or inactive.");
                }
            }
            else if (targetTenant == null && userDto.TenantId.HasValue && userDto.TenantId.Value > 0)
            {
                targetTenant = await _smartEcoWasteDb.Tenants
                    .FirstOrDefaultAsync(t => t.Id == userDto.TenantId.Value && t.IsActive && !t.IsDeleted);

                if (targetTenant == null)
                {
                    return ServiceResponse<string>.Fail("Specified organization is invalid or inactive.");
                }
            }
            else if (targetTenant == null && _tenantAccessor?.Tenant != null && _tenantAccessor.Tenant.TenantId > 0)
            {
                targetTenant = await _smartEcoWasteDb.Tenants
                    .FirstOrDefaultAsync(t => t.Id == _tenantAccessor.Tenant.TenantId && t.IsActive && !t.IsDeleted);
            }

            if (targetTenant == null)
            {
                // Default to first active public organization
                targetTenant = await _smartEcoWasteDb.Tenants
                    .FirstOrDefaultAsync(t => t.IsActive && !t.IsDeleted);

                if (targetTenant == null)
                {
                    return ServiceResponse<string>.Fail("No active organization found to register with.");
                }
            }

            var newUser = new User
            {
                Name = userDto.Name,
                Email = userDto.Email.Trim(),
                PasswordHash = new PasswordHasher<User>().HashPassword(new User(), userDto.PasswordHash),
                TenantId = targetTenant.Id,
                RoleId = 2, // Always regular User role on public registration
                IsEmailConfirmed = false
            };

            // Authorize user creation under verified target tenant context
            _tenantAccessor.SetTenant(targetTenant.Id, false);
            _smartEcoWasteDb.Users.Add(newUser);
            await _smartEcoWasteDb.SaveChangesAsync();

            return ServiceResponse<string>.Success(
                "User created successfully",
                "User created successfully"
            );
        }

        // ──────────────────────────────────────────────────────────────────────
        // REFRESH-TOKEN HELPERS
        // ──────────────────────────────────────────────────────────────────────

        /// <summary>
        /// Produces the SHA-256 hex digest of a raw refresh token so that only
        /// the hash — never the plaintext — is stored in the database.
        /// </summary>
        private static string HashRefreshToken(string rawToken)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }

        /// <summary>
        /// Validates a raw refresh token by hashing it and comparing against the
        /// stored hash.  Also checks expiry and that the account is still active.
        /// The caller never supplies a UserId — the lookup is entirely token-driven.
        /// </summary>
        private async Task<User?> ValidateRefreshTokenAsync(string rawToken)
        {
            var hash = HashRefreshToken(rawToken);
            var user = await _smartEcoWasteDb.Users
                .IgnoreQueryFilters()
                .Include(u => u.Role)
                .Include(u => u.Tenant)
                .FirstOrDefaultAsync(u => u.RefreshToken == hash && !u.IsDeleted);

            if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                return null;
            }
            return user;
        }

        public async Task<ServiceResponse<TokenResponseDto>> RefreshTokensAsync(RefreshTokenRequestDto request)
        {
            var user = await ValidateRefreshTokenAsync(request.RefreshToken);
            if (user == null)
            {
                return ServiceResponse<TokenResponseDto>.Fail("Refresh token is invalid, expired, or has already been used.");
            }

            _tenantAccessor.SetTenant(user.TenantId, user.Role?.Name == "SuperAdmin");
            // CreateTokenResponse issues a new refresh token (rotation) and persists the new hash
            return await CreateTokenResponse(user);
        }

        public async Task<ServiceResponse<string>> RevokeRefreshTokenAsync(string rawToken)
        {
            var hash = HashRefreshToken(rawToken);
            var user = await _smartEcoWasteDb.Users
                .IgnoreQueryFilters()
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.RefreshToken == hash);

            if (user != null)
            {
                _tenantAccessor.SetTenant(user.TenantId, user.Role?.Name == "SuperAdmin");
                user.RefreshToken = null;
                user.RefreshTokenExpiryTime = null;
                user.UpdatedAt = DateTime.UtcNow;
                await _smartEcoWasteDb.SaveChangesAsync();
            }

            // Always return success — do not reveal whether the token existed
            return ServiceResponse<string>.Success("", "Logged out successfully.");
        }

        public async Task<ServiceResponse<TokenResponseDto>> LoginAsync(LoginDto userDto)
        {
            var query = _smartEcoWasteDb.Users
                .IgnoreQueryFilters()
                .Include(u => u.Role)
                .Include(u => u.Tenant)
                .Where(u => !u.IsDeleted && u.Email == userDto.Email);

            if (!string.IsNullOrWhiteSpace(userDto.TenantCode))
            {
                query = query.Where(u => u.Tenant != null && u.Tenant.Code == userDto.TenantCode.Trim());
            }
            else if (userDto.TenantId.HasValue && userDto.TenantId.Value > 0)
            {
                query = query.Where(u => u.TenantId == userDto.TenantId.Value);
            }

            var user = await query.FirstOrDefaultAsync();
            if (user == null)
            {
                return ServiceResponse<TokenResponseDto>.Fail("Invalid email, password, or tenant workspace.");
            }

            if (new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, userDto.PasswordHash)
                == PasswordVerificationResult.Success)
            {
                _tenantAccessor.SetTenant(user.TenantId, user.Role?.Name == "SuperAdmin");
                var response = await CreateTokenResponse(user);
                return response;
            }
            else
            {
                return ServiceResponse<TokenResponseDto>.Fail("Invalid email or password.");
            }
        }

        private async Task<ServiceResponse<TokenResponseDto>> CreateTokenResponse(User user)
        {
            if (user.Tenant == null && user.TenantId > 0)
            {
                user.Tenant = await _smartEcoWasteDb.Tenants
                    .FirstOrDefaultAsync(t => t.Id == user.TenantId);
            }

            var expiryMinutes = int.TryParse(_configuration["AppSettings:ExpiryMinutes"], out var minutes) ? minutes : 15;
            var rawRefreshToken = await GenerateAndSaveRefreshTokenAsync(user);

            var response = new TokenResponseDto
            {
                AccessToken = CreateToken(user, expiryMinutes),
                RefreshToken = rawRefreshToken,
                ExpiresIn = expiryMinutes * 60,
                UserId = user.Id,
                TenantId = user.TenantId,
                TenantName = user.Tenant?.Name ?? "Main Workspace",
                TenantCode = user.Tenant?.Code ?? "MAIN",
                OrganizationType = user.Tenant?.OrganizationType ?? "CommercialMall",
                Role = user.Role?.Name ?? "User",
                UserName = user.Name,
                Email = user.Email
            };

            return ServiceResponse<TokenResponseDto>.Success(
                response,
                "Tokens generated successfully"
            );
        }

        /// <summary>
        /// Generates a cryptographically random 32-byte refresh token, stores its SHA-256
        /// hash (never the raw value), and returns the raw token for the client.
        /// Rotation: every call replaces the old hash — previous refresh tokens are invalidated.
        /// </summary>
        private async Task<string> GenerateAndSaveRefreshTokenAsync(User user)
        {
            var randomBytes = new byte[32];
            RandomNumberGenerator.Fill(randomBytes);
            var rawToken = Convert.ToBase64String(randomBytes);

            var refreshTokenExpiryDays = int.TryParse(_configuration["AppSettings:RefreshTokenExpiryDays"], out var days) ? days : 7;
            user.RefreshToken = HashRefreshToken(rawToken);   // store hash only
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(refreshTokenExpiryDays);
            user.UpdatedAt = DateTime.UtcNow;
            await _smartEcoWasteDb.SaveChangesAsync();
            return rawToken;   // return raw token to the client
        }

        private string CreateToken(User user, int expiryMinutes)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.Name, user.Email),
                new(ClaimTypes.Email, user.Email),
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Role, user.Role?.Name ?? "User"),
                new("TenantId", user.TenantId.ToString()),
                new("TenantCode", user.Tenant?.Code ?? ""),
                new("TenantName", user.Tenant?.Name ?? ""),
                new("OrganizationType", user.Tenant?.OrganizationType ?? "CommercialMall")
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["AppSettings:Token"]!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

            var tokenDescriptor = new JwtSecurityToken(
                issuer: _configuration["AppSettings:Issuer"],
                audience: _configuration["AppSettings:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }


        public async Task<ServiceResponse<List<UserResponseDto>>> GetAllAsync()
        {
            var query = _smartEcoWasteDb.Users
                .Include(u => u.Role)
                .Include(u => u.Tenant)
                .Include(u => u.UserReports)
                .Include(u => u.Points)
                .Where(u => u.IsDeleted == false);

            // Tenant isolation: Standard tenant users/admins only see users within their organization.
            // SuperAdmin can see all users across tenants.
            if (_tenantAccessor?.Tenant != null && _tenantAccessor.Tenant.TenantId > 0 && !_tenantAccessor.Tenant.IsSuperAdmin)
            {
                query = query.Where(u => u.TenantId == _tenantAccessor.Tenant.TenantId);
            }

            var users = await query.ToListAsync();

            var results = _mapper.Map<List<UserResponseDto>>(users);

            for (int i = 0; i < users.Count; i++)
            {
                results[i].TenantName = users[i].Tenant?.Name ?? $"Tenant #{users[i].TenantId}";
                results[i].RoleName = users[i].Role?.Name ?? "User";
                results[i].Reports = users[i].UserReports?.Count ?? 0;
                results[i].UserPoints = users[i].Points != null
                    ? users[i].Points.Sum(up => up.Points)
                    : 0;
            }

            return ServiceResponse<List<UserResponseDto>>.Success(
                results,
                "Users retrieved successfully"
            );
        }

        public async Task<ServiceResponse<string>> MakeStaffAsync(int adminUserId, int targetUserId)
        {
            var targetUser = await _smartEcoWasteDb.Users
                .IgnoreQueryFilters()
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == targetUserId && !u.IsDeleted);

            if (targetUser == null)
            {
                return ServiceResponse<string>.Fail("User not found.");
            }

            if (adminUserId == targetUserId)
            {
                return ServiceResponse<string>.Fail("Administrators cannot change their own role to staff.");
            }

            var staffRole = await _smartEcoWasteDb.Roles
                .FirstOrDefaultAsync(r => r.Id == 3 || r.Name == "Staff");

            if (staffRole == null)
            {
                staffRole = new Role { Name = "Staff" };
                _smartEcoWasteDb.Roles.Add(staffRole);
                await _smartEcoWasteDb.SaveChangesAsync();
            }

            var adminUser = await _smartEcoWasteDb.Users
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(u => u.Id == adminUserId);

            if (adminUser != null && adminUser.TenantId > 0)
            {
                targetUser.TenantId = adminUser.TenantId;
            }

            targetUser.RoleId = staffRole.Id;
            targetUser.UpdatedAt = DateTime.UtcNow;
            await _smartEcoWasteDb.SaveChangesAsync();

            return ServiceResponse<string>.Success(
                "User successfully assigned Staff role",
                $"User '{targetUser.Name}' ({targetUser.Email}) is now assigned as Staff."
            );
        }

        public async Task<ServiceResponse<string>> AssignRolesAsync(int adminUserId, AssignUserRolesDto userRole)
        {
            var targetUser = await _smartEcoWasteDb.Users
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(u => u.Id == userRole.UserId && !u.IsDeleted);

            if (targetUser == null)
            {
                return ServiceResponse<string>.Fail("User not found in your organization.");
            }

            // Prevent self-lockout
            if (adminUserId == userRole.UserId)
            {
                return ServiceResponse<string>.Fail("Administrators cannot modify their own role.");
            }

            // Validate target role
            var targetRole = await _smartEcoWasteDb.Roles
                .FirstOrDefaultAsync(r => r.Id == userRole.RoleId && !r.IsDeleted);

            if (targetRole == null)
            {
                return ServiceResponse<string>.Fail("Specified role does not exist.");
            }

            // Prevent unauthorized privilege escalation to SuperAdmin
            if (targetRole.Name.Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase))
            {
                return ServiceResponse<string>.Fail("Unauthorized: Cannot assign platform SuperAdmin role.");
            }

            var adminUser = await _smartEcoWasteDb.Users
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(u => u.Id == adminUserId);

            if (adminUser != null && adminUser.TenantId > 0 && targetUser.TenantId != adminUser.TenantId)
            {
                targetUser.TenantId = adminUser.TenantId;
            }

            targetUser.RoleId = userRole.RoleId;
            targetUser.UpdatedAt = DateTime.UtcNow;
            await _smartEcoWasteDb.SaveChangesAsync();

            return ServiceResponse<string>.Success(
                "Role assigned successfully",
                $"User '{targetUser.Name}' role updated to '{targetRole.Name}'"
            );
        }

        public async Task<ServiceResponse<string>> ChangePasswordAsync(int userId, ChangePasswordDto dto)
        {
            var user = await _smartEcoWasteDb.Users.FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted);
            if (user == null)
            {
                return ServiceResponse<string>.Fail("User account not found.");
            }

            // Verify current password
            var hasher = new PasswordHasher<User>();
            var verifyResult = hasher.VerifyHashedPassword(user, user.PasswordHash, dto.CurrentPassword);
            if (verifyResult != PasswordVerificationResult.Success)
            {
                return ServiceResponse<string>.Fail("Current password is incorrect.");
            }

            if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 6)
            {
                return ServiceResponse<string>.Fail("New password must be at least 6 characters.");
            }

            user.PasswordHash = hasher.HashPassword(user, dto.NewPassword);
            await _smartEcoWasteDb.SaveChangesAsync();

            return ServiceResponse<string>.Success("", "Password changed successfully.");
        }

        public async Task<ServiceResponse<string>> AdminResetPasswordAsync(int adminUserId, AdminResetPasswordDto dto)
        {
            var targetUser = await _smartEcoWasteDb.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == dto.TargetUserId && !u.IsDeleted);

            if (targetUser == null)
            {
                return ServiceResponse<string>.Fail("Target user not found in your organization.");
            }

            if (targetUser.Role?.Name.Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase) == true)
            {
                return ServiceResponse<string>.Fail("Cannot reset the password of a platform SuperAdmin.");
            }

            if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 6)
            {
                return ServiceResponse<string>.Fail("New password must be at least 6 characters.");
            }

            var hasher = new PasswordHasher<User>();
            targetUser.PasswordHash = hasher.HashPassword(targetUser, dto.NewPassword);
            await _smartEcoWasteDb.SaveChangesAsync();

            return ServiceResponse<string>.Success("", $"Password reset successfully for user '{targetUser.Name}'.");
        }

        public async Task<ServiceResponse<string>> UpdateUserAsync(int callerUserId, bool isAdmin, UpdatePasswordDto update)
        {
            // Enforce ownership: only self or tenant Admin can update password
            if (update.UserId != callerUserId && !isAdmin)
            {
                return ServiceResponse<string>.Fail("Unauthorized to change another user's password.");
            }

            var user = await _smartEcoWasteDb.Users.FirstOrDefaultAsync(u => u.Id == update.UserId && !u.IsDeleted);
            if (user == null)
            {
                return ServiceResponse<string>.Fail("User not found in your organization.");
            }

            if (string.IsNullOrWhiteSpace(update.Password) || update.Password.Length < 6)
            {
                return ServiceResponse<string>.Fail("Password must be at least 6 characters.");
            }

            user.PasswordHash = new PasswordHasher<User>().HashPassword(user, update.Password);
            await _smartEcoWasteDb.SaveChangesAsync();

            return ServiceResponse<string>.Success("", "Password updated successfully.");
        }

        public async Task<ServiceResponse<string>> DeleteUserAsync(int adminUserId, int targetUserId)
        {
            if (adminUserId == targetUserId)
            {
                return ServiceResponse<string>.Fail("You cannot delete your own account.");
            }

            var user = await _smartEcoWasteDb.Users.FirstOrDefaultAsync(u => u.Id == targetUserId && !u.IsDeleted);
            if (user == null)
            {
                return ServiceResponse<string>.Fail("User not found in your organization.");
            }

            user.IsDeleted = true;
            await _smartEcoWasteDb.SaveChangesAsync();
            return ServiceResponse<string>.Success("", $"{user.Name} deleted successfully");
        }

        public async Task<ServiceResponse<List<Role>>> GetAllRolesAsync()
        {
            var roles = await _smartEcoWasteDb.Roles
                .Where(r => r.IsDeleted == false && r.Name != "SuperAdmin")
                .ToListAsync();

            return ServiceResponse<List<Role>>.Success(
                roles,
                "Roles retrieved successfully"
            );
        }

        public async Task<ServiceResponse<GetUserDto>> GetUser(int callerUserId, bool isAdminOrSupervisor, int targetUserId)
        {
            // Ownership check: Caller must be the target user or have Admin/Supervisor role
            if (callerUserId != targetUserId && !isAdminOrSupervisor)
            {
                return ServiceResponse<GetUserDto>.Fail("Unauthorized: You can only view your own profile.");
            }

            var query = _smartEcoWasteDb.Users
                .Include(u => u.UserReports)
                .Include(u => u.Points)
                .Where(u => u.IsDeleted == false);

            if (callerUserId == targetUserId)
            {
                query = query.IgnoreQueryFilters();
            }

            var user = await query.FirstOrDefaultAsync(u => u.Id == targetUserId);

            if (user == null)
            {
                return ServiceResponse<GetUserDto>.Fail("User not found in your organization.");
            }

            var results = new GetUserDto
            {
                Name = user.Name,
                Email = user.Email,
                Reports = user.UserReports!.Count,
                Points = user.Points != null
                    ? user.Points.Sum(up => up.Points)
                    : 0,
            };

            return ServiceResponse<GetUserDto>.Success(
                results,
                "User info retrieved successfully"
            );
        }
    }
}
