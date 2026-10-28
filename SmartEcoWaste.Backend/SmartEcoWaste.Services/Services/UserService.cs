using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Data.Entities;
using SmartEcoWaste.Infrastructure.DbContexts;
using SmartEcoWaste.Infrastructure.MultiTenancy;
using SmartEcoWaste.Services.Helpers;
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
    public class UserService : IUserService
    {
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;
        private readonly SmartEcoWasteDbContext _smartEcoWasteDb;
        private readonly ITenantContextAccessor _tenantAccessor;
        private readonly IEmailService _emailService;

        public UserService(
            IMapper mapper,
            SmartEcoWasteDbContext smartEcoWasteDb,
            IConfiguration configuration,
            ITenantContextAccessor tenantAccessor,
            IEmailService emailService)
        {
            _mapper = mapper;
            _smartEcoWasteDb = smartEcoWasteDb;
            _configuration = configuration;
            _tenantAccessor = tenantAccessor;
            _emailService = emailService;
        }

        public async Task<ServiceResponse<string>> CreateAsyc(UserDto userDto)
        {
            if (string.IsNullOrWhiteSpace(userDto.Email))
            {
                return ServiceResponse<string>.Fail("Email is required.");
            }

            // Issue C: Strong password policy enforcement across registration
            var (isPasswordValid, passwordError) = PasswordPolicyHelper.ValidatePassword(
                userDto.PasswordHash,
                userDto.Email,
                userDto.Name
            );

            if (!isPasswordValid)
            {
                return ServiceResponse<string>.Fail(passwordError ?? "Password does not meet complexity requirements.");
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

            // Generate single-use expiring email verification token
            var verificationToken = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
            var tokenExpiry = DateTime.UtcNow.AddHours(24);

            var defaultUserRole = await _smartEcoWasteDb.Roles
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(r => r.Name == "User");

            var newUser = new User
            {
                Name = userDto.Name,
                Email = userDto.Email.Trim(),
                PasswordHash = new PasswordHasher<User>().HashPassword(new User(), userDto.PasswordHash),
                TenantId = targetTenant.Id,
                RoleId = defaultUserRole?.Id ?? 2, // Dynamically resolved regular User role
                IsEmailConfirmed = false,
                EmailConfirmationToken = verificationToken,
                EmailConfirmationTokenExpiry = tokenExpiry,
                IsApproved = false // Pending organization administrator approval
            };

            // Authorize user creation under verified target tenant context
            _tenantAccessor.SetTenant(targetTenant.Id, false);
            _smartEcoWasteDb.Users.Add(newUser);
            await _smartEcoWasteDb.SaveChangesAsync();

            // Send registration pending notification email
            var orgName = targetTenant.Name ?? "Your Organization";
            await _emailService.SendRegistrationPendingAsync(newUser.Email, newUser.Name, orgName);

            return ServiceResponse<string>.Success(
                "Your account has been registered successfully and is awaiting approval by your organization administrator. You will receive an email notification once your account has been approved, after which you can log in.",
                "Account registered successfully. Awaiting administrator approval."
            );
        }

        // ──────────────────────────────────────────────────────────────────────
        // REFRESH-TOKEN HELPERS
        // ──────────────────────────────────────────────────────────────────────

        private static string HashRefreshToken(string rawToken)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }

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

            // Guard against deactivated, unconfirmed, or unapproved accounts during token refresh
            var isSuperAdmin = user.Role?.Name.Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase) == true;
            if (!isSuperAdmin && (!user.IsEmailConfirmed || !user.IsApproved))
            {
                return null;
            }

            return user;
        }

        public async Task<ServiceResponse<TokenResponseDto>> RefreshTokensAsync(RefreshTokenRequestDto request)
        {
            var oldHash = HashRefreshToken(request.RefreshToken);
            var user = await _smartEcoWasteDb.Users
                .IgnoreQueryFilters()
                .Include(u => u.Role)
                .Include(u => u.Tenant)
                .FirstOrDefaultAsync(u => u.RefreshToken == oldHash && !u.IsDeleted);

            if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                return ServiceResponse<TokenResponseDto>.Fail("Refresh token is invalid, expired, or revoked.");
            }

            var isSuperAdmin = user.Role?.Name.Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase) == true;
            if (!isSuperAdmin && (!user.IsEmailConfirmed || !user.IsApproved))
            {
                return ServiceResponse<TokenResponseDto>.Fail("Account is unverified or awaiting administrative approval.");
            }

            // Generate new cryptographically random refresh token
            var randomBytes = new byte[32];
            RandomNumberGenerator.Fill(randomBytes);
            var rawNewRefreshToken = Convert.ToBase64String(randomBytes);
            var newHash = HashRefreshToken(rawNewRefreshToken);
            var refreshTokenExpiryDays = int.TryParse(_configuration["AppSettings:RefreshTokenExpiryDays"], out var days) ? days : 7;
            var newExpiry = DateTime.UtcNow.AddDays(refreshTokenExpiryDays);

            // Concurrency-safe atomic rotation:
            // Exactly one concurrent request can match the existing token hash.
            // Any racing request will see 0 rows updated and fail safely.
            var rowsUpdated = await _smartEcoWasteDb.Users
                .IgnoreQueryFilters()
                .Where(u => u.Id == user.Id && u.RefreshToken == oldHash)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(u => u.RefreshToken, newHash)
                    .SetProperty(u => u.RefreshTokenExpiryTime, newExpiry)
                    .SetProperty(u => u.UpdatedAt, DateTime.UtcNow));

            if (rowsUpdated == 0)
            {
                return ServiceResponse<TokenResponseDto>.Fail("Refresh token has already been rotated or is invalid.");
            }

            user.RefreshToken = newHash;
            user.RefreshTokenExpiryTime = newExpiry;
            _tenantAccessor.SetTenant(user.TenantId, isSuperAdmin);

            if (user.Tenant == null && user.TenantId > 0)
            {
                user.Tenant = await _smartEcoWasteDb.Tenants.FirstOrDefaultAsync(t => t.Id == user.TenantId);
            }

            var expiryMinutes = int.TryParse(_configuration["AppSettings:ExpiryMinutes"], out var minutes) ? minutes : 15;
            var response = new TokenResponseDto
            {
                AccessToken = CreateToken(user, expiryMinutes),
                RefreshToken = rawNewRefreshToken,
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

            return ServiceResponse<TokenResponseDto>.Success(response, "Tokens refreshed successfully");
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

            return ServiceResponse<string>.Success("", "Logged out successfully.");
        }

        public async Task<ServiceResponse<TokenResponseDto>> LoginAsync(LoginDto userDto)
        {
            var query = _smartEcoWasteDb.Users
                .IgnoreQueryFilters()
                .Include(u => u.Role)
                .Include(u => u.Tenant)
                .Where(u => !u.IsDeleted && u.Email == userDto.Email.Trim());

            if (!string.IsNullOrWhiteSpace(userDto.TenantCode))
            {
                query = query.Where(u => u.Tenant != null && u.Tenant.Code == userDto.TenantCode.Trim());
            }
            else if (userDto.TenantId.HasValue && userDto.TenantId.Value > 0)
            {
                query = query.Where(u => u.TenantId == userDto.TenantId.Value);
            }

            var user = await query.FirstOrDefaultAsync();

            // Issue D: Return generic error message to prevent user enumeration
            if (user == null)
            {
                return ServiceResponse<TokenResponseDto>.Fail("Invalid email or password.");
            }

            var verifyResult = new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, userDto.PasswordHash);
            if (verifyResult != PasswordVerificationResult.Success)
            {
                return ServiceResponse<TokenResponseDto>.Fail("Invalid email or password.");
            }

            var isSuperAdmin = user.Role?.Name.Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase) == true;

            // Organization-approved registration check: Pending users cannot access the system
            if (!isSuperAdmin && !user.IsApproved)
            {
                return ServiceResponse<TokenResponseDto>.Fail("Your account registration is currently pending approval by your organization administrator. You will receive an email notification once your account has been approved, after which you can log in.");
            }

            // Enforce account confirmation
            if (!isSuperAdmin && !user.IsEmailConfirmed)
            {
                return ServiceResponse<TokenResponseDto>.Fail("Your account has not yet been activated. Please wait for organization administrator approval.");
            }

            _tenantAccessor.SetTenant(user.TenantId, isSuperAdmin);
            var response = await CreateTokenResponse(user);
            return response;
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

        private async Task<string> GenerateAndSaveRefreshTokenAsync(User user)
        {
            var randomBytes = new byte[32];
            RandomNumberGenerator.Fill(randomBytes);
            var rawToken = Convert.ToBase64String(randomBytes);

            var refreshTokenExpiryDays = int.TryParse(_configuration["AppSettings:RefreshTokenExpiryDays"], out var days) ? days : 7;
            user.RefreshToken = HashRefreshToken(rawToken);
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(refreshTokenExpiryDays);
            user.UpdatedAt = DateTime.UtcNow;
            await _smartEcoWasteDb.SaveChangesAsync();
            return rawToken;
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

            var adminUser = await _smartEcoWasteDb.Users
                .IgnoreQueryFilters()
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == adminUserId);

            var isSuperAdmin = adminUser?.Role?.Name.Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase) == true;

            // Enforce tenant boundary: reject cross-tenant role modification immediately
            if (!isSuperAdmin && adminUser != null && adminUser.TenantId > 0 && targetUser.TenantId != adminUser.TenantId)
            {
                return ServiceResponse<string>.Fail("Cross-tenant role assignment is not permitted. The user belongs to another organization.");
            }

            var staffRole = await _smartEcoWasteDb.Roles
                .FirstOrDefaultAsync(r => r.Id == 3 || r.Name == "Staff");

            if (staffRole == null)
            {
                staffRole = new Role { Name = "Staff" };
                _smartEcoWasteDb.Roles.Add(staffRole);
                await _smartEcoWasteDb.SaveChangesAsync();
            }

            // Invalidate existing sessions/tokens upon role change
            targetUser.RefreshToken = null;
            targetUser.RefreshTokenExpiryTime = null;
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
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userRole.UserId && !u.IsDeleted);

            if (targetUser == null)
            {
                return ServiceResponse<string>.Fail("User not found in your organization.");
            }

            if (adminUserId == userRole.UserId)
            {
                return ServiceResponse<string>.Fail("Administrators cannot modify their own role.");
            }

            var adminUser = await _smartEcoWasteDb.Users
                .IgnoreQueryFilters()
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == adminUserId);

            var isSuperAdmin = adminUser?.Role?.Name.Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase) == true;

            // Enforce tenant boundary: reject cross-tenant role modification immediately
            if (!isSuperAdmin && adminUser != null && adminUser.TenantId > 0 && targetUser.TenantId != adminUser.TenantId)
            {
                return ServiceResponse<string>.Fail("Cross-tenant role assignment is not permitted. The user belongs to another organization.");
            }

            var targetRole = await _smartEcoWasteDb.Roles
                .FirstOrDefaultAsync(r => r.Id == userRole.RoleId && !r.IsDeleted);

            if (targetRole == null)
            {
                return ServiceResponse<string>.Fail("Specified role does not exist.");
            }

            if (targetRole.Name.Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase))
            {
                return ServiceResponse<string>.Fail("Unauthorized: Cannot assign platform SuperAdmin role.");
            }

            // Invalidate existing sessions/tokens upon role change
            targetUser.RefreshToken = null;
            targetUser.RefreshTokenExpiryTime = null;
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

            var hasher = new PasswordHasher<User>();
            var verifyResult = hasher.VerifyHashedPassword(user, user.PasswordHash, dto.CurrentPassword);
            if (verifyResult != PasswordVerificationResult.Success)
            {
                return ServiceResponse<string>.Fail("Current password is incorrect.");
            }

            var (isValid, errorMsg) = PasswordPolicyHelper.ValidatePassword(dto.NewPassword, user.Email, user.Name);
            if (!isValid)
            {
                return ServiceResponse<string>.Fail(errorMsg ?? "Password does not meet complexity requirements.");
            }

            user.PasswordHash = hasher.HashPassword(user, dto.NewPassword);
            // Invalidate existing sessions/tokens upon credential change
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            user.UpdatedAt = DateTime.UtcNow;
            await _smartEcoWasteDb.SaveChangesAsync();

            return ServiceResponse<string>.Success("", "Password changed successfully. Existing sessions have been revoked.");
        }

        public async Task<ServiceResponse<string>> AdminResetPasswordAsync(int adminUserId, AdminResetPasswordDto dto)
        {
            var adminUser = await _smartEcoWasteDb.Users
                .IgnoreQueryFilters()
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == adminUserId);

            var isSuperAdmin = adminUser?.Role?.Name.Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase) == true;

            var targetUser = await _smartEcoWasteDb.Users
                .IgnoreQueryFilters()
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == dto.TargetUserId && !u.IsDeleted);

            if (targetUser == null)
            {
                return ServiceResponse<string>.Fail("Target user not found in your organization.");
            }

            if (!isSuperAdmin && adminUser != null && targetUser.TenantId != adminUser.TenantId)
            {
                return ServiceResponse<string>.Fail("Unauthorized: Target user belongs to another organization.");
            }

            if (targetUser.Role?.Name.Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase) == true)
            {
                return ServiceResponse<string>.Fail("Cannot reset the password of a platform SuperAdmin.");
            }

            var (isValid, errorMsg) = PasswordPolicyHelper.ValidatePassword(dto.NewPassword, targetUser.Email, targetUser.Name);
            if (!isValid)
            {
                return ServiceResponse<string>.Fail(errorMsg ?? "Password does not meet complexity requirements.");
            }

            var hasher = new PasswordHasher<User>();
            targetUser.PasswordHash = hasher.HashPassword(targetUser, dto.NewPassword);
            // Invalidate existing sessions/tokens upon credential change
            targetUser.RefreshToken = null;
            targetUser.RefreshTokenExpiryTime = null;
            targetUser.UpdatedAt = DateTime.UtcNow;
            await _smartEcoWasteDb.SaveChangesAsync();

            return ServiceResponse<string>.Success("", $"Password reset successfully for user '{targetUser.Name}'. Existing sessions have been revoked.");
        }

        public async Task<ServiceResponse<string>> UpdateUserAsync(int callerUserId, bool isAdmin, UpdatePasswordDto update)
        {
            if (update.UserId != callerUserId && !isAdmin)
            {
                return ServiceResponse<string>.Fail("Unauthorized to change another user's password.");
            }

            var user = await _smartEcoWasteDb.Users.FirstOrDefaultAsync(u => u.Id == update.UserId && !u.IsDeleted);
            if (user == null)
            {
                return ServiceResponse<string>.Fail("User not found in your organization.");
            }

            var (isValid, errorMsg) = PasswordPolicyHelper.ValidatePassword(update.Password, user.Email, user.Name);
            if (!isValid)
            {
                return ServiceResponse<string>.Fail(errorMsg ?? "Password does not meet complexity requirements.");
            }

            user.PasswordHash = new PasswordHasher<User>().HashPassword(user, update.Password);
            // Invalidate existing sessions/tokens upon credential change
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            user.UpdatedAt = DateTime.UtcNow;
            await _smartEcoWasteDb.SaveChangesAsync();

            return ServiceResponse<string>.Success("", "Password updated successfully. Existing sessions have been revoked.");
        }

        public async Task<ServiceResponse<string>> DeleteUserAsync(int adminUserId, int targetUserId)
        {
            if (adminUserId == targetUserId)
            {
                return ServiceResponse<string>.Fail("You cannot delete your own account.");
            }

            var adminUser = await _smartEcoWasteDb.Users
                .IgnoreQueryFilters()
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == adminUserId);

            var isSuperAdmin = adminUser?.Role?.Name.Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase) == true;

            var user = await _smartEcoWasteDb.Users
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(u => u.Id == targetUserId && !u.IsDeleted);

            if (user == null)
            {
                return ServiceResponse<string>.Fail("User not found in your organization.");
            }

            if (!isSuperAdmin && adminUser != null && user.TenantId != adminUser.TenantId)
            {
                return ServiceResponse<string>.Fail("Unauthorized: Cannot delete a user from another organization.");
            }

            user.IsDeleted = true;
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            user.UpdatedAt = DateTime.UtcNow;
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
                Reports = user.UserReports?.Count ?? 0,
                Points = user.Points != null
                    ? user.Points.Sum(up => up.Points)
                    : 0,
            };

            return ServiceResponse<GetUserDto>.Success(
                results,
                "User info retrieved successfully"
            );
        }

        // ──────────────────────────────────────────────────────────────────────
        // EMAIL VERIFICATION, PASSWORD RESET & ORGANIZATION APPROVAL LIFECYCLE
        // ──────────────────────────────────────────────────────────────────────

        public async Task<ServiceResponse<string>> VerifyEmailAsync(string email, string token)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(token))
            {
                return ServiceResponse<string>.Fail("Invalid verification request.");
            }

            var user = await _smartEcoWasteDb.Users
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.Trim().ToLower() && !u.IsDeleted);

            if (user == null)
            {
                return ServiceResponse<string>.Fail("Invalid verification token or account not found.");
            }

            if (user.IsEmailConfirmed)
            {
                return ServiceResponse<string>.Success("Your email address is already verified. You can now log in once approved by your organization.");
            }

            if (user.EmailConfirmationToken != token)
            {
                return ServiceResponse<string>.Fail("Invalid verification token.");
            }

            if (user.EmailConfirmationTokenExpiry.HasValue && user.EmailConfirmationTokenExpiry.Value < DateTime.UtcNow)
            {
                return ServiceResponse<string>.Fail("Verification token has expired. Please request a new verification link.");
            }

            user.IsEmailConfirmed = true;
            user.EmailConfirmationToken = null;
            user.EmailConfirmationTokenExpiry = null;
            user.UpdatedAt = DateTime.UtcNow;
            await _smartEcoWasteDb.SaveChangesAsync();

            return ServiceResponse<string>.Success(
                user.IsApproved
                    ? "Email verified successfully! You may now sign in."
                    : "Email verified successfully! Your account is pending administrator approval before login is enabled.",
                "Email verified successfully."
            );
        }

        public async Task<ServiceResponse<string>> ForgotPasswordAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return ServiceResponse<string>.Fail("Email is required.");
            }

            var user = await _smartEcoWasteDb.Users
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.Trim().ToLower() && !u.IsDeleted);

            // Generic response to prevent user enumeration attacks
            var genericMsg = "If your email address is registered, a password reset link has been sent to your inbox.";

            if (user != null)
            {
                var resetToken = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
                user.PasswordResetToken = resetToken;
                user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
                user.UpdatedAt = DateTime.UtcNow;
                await _smartEcoWasteDb.SaveChangesAsync();

                var clientBaseUrl = _configuration["AppSettings:ClientBaseUrl"] ?? "http://localhost:4200";
                var resetLink = $"{clientBaseUrl.TrimEnd('/')}/auth/reset-password?token={Uri.EscapeDataString(resetToken)}&email={Uri.EscapeDataString(user.Email)}";
                await _emailService.SendPasswordResetAsync(user.Email, user.Name, resetLink);
            }

            return ServiceResponse<string>.Success(genericMsg, genericMsg);
        }

        public async Task<ServiceResponse<string>> ResetPasswordWithTokenAsync(ResetPasswordWithTokenDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Token) || string.IsNullOrWhiteSpace(dto.NewPassword))
            {
                return ServiceResponse<string>.Fail("All fields are required.");
            }

            var user = await _smartEcoWasteDb.Users
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.Trim().ToLower() && !u.IsDeleted);

            if (user == null || user.PasswordResetToken != dto.Token)
            {
                return ServiceResponse<string>.Fail("Invalid or expired password reset token.");
            }

            if (user.PasswordResetTokenExpiry.HasValue && user.PasswordResetTokenExpiry.Value < DateTime.UtcNow)
            {
                return ServiceResponse<string>.Fail("Password reset token has expired. Please request a new password reset.");
            }

            var (isValid, errorMsg) = PasswordPolicyHelper.ValidatePassword(dto.NewPassword, user.Email, user.Name);
            if (!isValid)
            {
                return ServiceResponse<string>.Fail(errorMsg ?? "Password does not meet complexity requirements.");
            }

            user.PasswordHash = new PasswordHasher<User>().HashPassword(user, dto.NewPassword);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            user.UpdatedAt = DateTime.UtcNow;
            await _smartEcoWasteDb.SaveChangesAsync();

            return ServiceResponse<string>.Success("Password has been reset successfully. You can now sign in with your new password.", "Password reset successful.");
        }

        public async Task<ServiceResponse<List<PendingUserDto>>> GetPendingUsersAsync(int adminUserId)
        {
            var adminUser = await _smartEcoWasteDb.Users
                .IgnoreQueryFilters()
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == adminUserId);

            if (adminUser == null)
            {
                return ServiceResponse<List<PendingUserDto>>.Fail("Administrator not found.");
            }

            var isSuperAdmin = adminUser.Role?.Name.Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase) == true;

            var query = _smartEcoWasteDb.Users
                .IgnoreQueryFilters()
                .Include(u => u.Tenant)
                .Where(u => !u.IsDeleted && !u.IsApproved);

            if (!isSuperAdmin)
            {
                query = query.Where(u => u.TenantId == adminUser.TenantId);
            }

            var pendingUsers = await query
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new PendingUserDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    TenantId = u.TenantId,
                    TenantName = u.Tenant != null ? u.Tenant.Name : $"Tenant #{u.TenantId}",
                    IsEmailConfirmed = u.IsEmailConfirmed,
                    IsApproved = u.IsApproved,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            return ServiceResponse<List<PendingUserDto>>.Success(pendingUsers, "Pending user registrations retrieved successfully.");
        }

        public async Task<ServiceResponse<string>> ApproveUserAsync(int adminUserId, int targetUserId)
        {
            var adminUser = await _smartEcoWasteDb.Users
                .IgnoreQueryFilters()
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == adminUserId);

            if (adminUser == null)
            {
                return ServiceResponse<string>.Fail("Administrator not found.");
            }

            var isSuperAdmin = adminUser.Role?.Name.Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase) == true;

            var targetUser = await _smartEcoWasteDb.Users
                .IgnoreQueryFilters()
                .Include(u => u.Tenant)
                .FirstOrDefaultAsync(u => u.Id == targetUserId && !u.IsDeleted);

            if (targetUser == null)
            {
                return ServiceResponse<string>.Fail("Target user not found.");
            }

            if (!isSuperAdmin && targetUser.TenantId != adminUser.TenantId)
            {
                return ServiceResponse<string>.Fail("Unauthorized: Cannot approve a user from another organization.");
            }

            targetUser.IsApproved = true;
            targetUser.IsEmailConfirmed = true; // Administrative approval confirms and activates the account for immediate login
            targetUser.ApprovedAt = DateTime.UtcNow;
            targetUser.ApprovedByUserId = adminUserId;
            targetUser.UpdatedAt = DateTime.UtcNow;
            await _smartEcoWasteDb.SaveChangesAsync();

            // Send notification email that account has been approved and user can now log in
            var orgName = targetUser.Tenant?.Name ?? "Your Organization";
            var clientBaseUrl = _configuration["AppSettings:ClientBaseUrl"] ?? "http://localhost:4200";
            var loginUrl = $"{clientBaseUrl.TrimEnd('/')}/auth/login";
            await _emailService.SendAccountApprovedAsync(targetUser.Email, targetUser.Name, orgName, loginUrl);

            return ServiceResponse<string>.Success($"User '{targetUser.Name}' ({targetUser.Email}) has been approved successfully. An email has been sent notifying them that they can now log in.", "User registration approved.");
        }

        public async Task<ServiceResponse<string>> RejectUserAsync(int adminUserId, int targetUserId)
        {
            var adminUser = await _smartEcoWasteDb.Users
                .IgnoreQueryFilters()
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == adminUserId);

            if (adminUser == null)
            {
                return ServiceResponse<string>.Fail("Administrator not found.");
            }

            var isSuperAdmin = adminUser.Role?.Name.Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase) == true;

            var targetUser = await _smartEcoWasteDb.Users
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(u => u.Id == targetUserId && !u.IsDeleted);

            if (targetUser == null)
            {
                return ServiceResponse<string>.Fail("Target user not found.");
            }

            if (!isSuperAdmin && targetUser.TenantId != adminUser.TenantId)
            {
                return ServiceResponse<string>.Fail("Unauthorized: Cannot reject a user from another organization.");
            }

            targetUser.IsDeleted = true;
            targetUser.RefreshToken = null;
            targetUser.RefreshTokenExpiryTime = null;
            targetUser.UpdatedAt = DateTime.UtcNow;
            await _smartEcoWasteDb.SaveChangesAsync();

            return ServiceResponse<string>.Success($"User '{targetUser.Name}' registration has been rejected and removed.", "User registration rejected.");
        }
    }
}
