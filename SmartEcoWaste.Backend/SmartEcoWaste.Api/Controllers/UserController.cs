using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Services.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SmartEcoWaste.Api.Controllers
{
    [Route("api/")]
    [ApiController]
    public class UserController(IUserService userService, IAuditLogService auditLogService) : Controller
    {
        private readonly IUserService _userService = userService;
        private readonly IAuditLogService _auditLogService = auditLogService;

        private int GetCurrentUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(idClaim, out var id) ? id : 0;
        }

        private int GetCurrentTenantId()
        {
            var tenantClaim = User.FindFirst("TenantId")?.Value;
            return int.TryParse(tenantClaim, out var id) ? id : 0;
        }

        private string? GetCurrentUserEmail()
        {
            return User.FindFirst(ClaimTypes.Email)?.Value;
        }

        private bool IsAdminOrSupervisor()
        {
            return User.IsInRole("Admin") || User.IsInRole("Supervisor") || User.IsInRole("SuperAdmin");
        }

        [AllowAnonymous]
        [EnableRateLimiting("AuthRateLimit")]
        [HttpPost("create-user")]
        public async Task<IActionResult> CreateUser([FromBody] UserDto user)
        {
            // If the creator is an authenticated admin/supervisor, bind new user strictly to caller's tenant
            var authenticatedTenantId = GetCurrentTenantId();
            if (authenticatedTenantId > 0 && !User.IsInRole("SuperAdmin"))
            {
                user.TenantId = authenticatedTenantId;
            }

            var res = await _userService.CreateAsyc(user);
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }

        [AllowAnonymous]
        [EnableRateLimiting("AuthRateLimit")]
        [HttpPost("user-login")]
        public async Task<IActionResult> Login([FromBody] LoginDto user)
        {
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
            var res = await _userService.LoginAsync(user);

            if (res.IsSuccess && res.Data != null)
            {
                await _auditLogService.LogAsync(
                    res.Data.TenantId,
                    res.Data.UserId,
                    user.Email,
                    "LoginSuccess",
                    "User",
                    res.Data.UserId,
                    $"User {user.Email} authenticated successfully",
                    ip
                );
                return Ok(res);
            }

            await _auditLogService.LogAsync(
                user.TenantId ?? 0,
                null,
                user.Email,
                "LoginFailed",
                "User",
                null,
                $"Authentication failed for {user.Email}: {res.Message}",
                ip
            );
            return Unauthorized(res);
        }

        [AllowAnonymous]
        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string email, [FromQuery] string token)
        {
            var res = await _userService.VerifyEmailAsync(email, token);
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }

        [AllowAnonymous]
        [EnableRateLimiting("AuthRateLimit")]
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            var res = await _userService.ForgotPasswordAsync(dto.Email);
            return Ok(res);
        }

        [AllowAnonymous]
        [EnableRateLimiting("AuthRateLimit")]
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordWithTokenDto dto)
        {
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
            var res = await _userService.ResetPasswordWithTokenAsync(dto);
            if (res.IsSuccess)
            {
                await _auditLogService.LogAsync(
                    0,
                    null,
                    dto.Email,
                    "PasswordResetSuccess",
                    "User",
                    null,
                    $"Password reset completed for {dto.Email}",
                    ip
                );
                return Ok(res);
            }

            return BadRequest(res);
        }

        [Authorize(Roles = "Admin,Supervisor,SuperAdmin")]
        [HttpGet("pending-approvals")]
        public async Task<IActionResult> GetPendingApprovals()
        {
            var adminId = GetCurrentUserId();
            var res = await _userService.GetPendingUsersAsync(adminId);
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }

        [Authorize(Roles = "Admin,SuperAdmin")]
        [HttpPost("users/{id}/approve")]
        public async Task<IActionResult> ApproveUser(int id)
        {
            var adminId = GetCurrentUserId();
            var res = await _userService.ApproveUserAsync(adminId, id);
            if (res.IsSuccess)
            {
                await _auditLogService.LogAsync(
                    GetCurrentTenantId(),
                    adminId,
                    GetCurrentUserEmail(),
                    "ApproveUser",
                    "User",
                    id,
                    $"User registration {id} approved by admin {adminId}"
                );
                return Ok(res);
            }
            return BadRequest(res);
        }

        [Authorize(Roles = "Admin,SuperAdmin")]
        [HttpPost("users/{id}/reject")]
        public async Task<IActionResult> RejectUser(int id)
        {
            var adminId = GetCurrentUserId();
            var res = await _userService.RejectUserAsync(adminId, id);
            if (res.IsSuccess)
            {
                await _auditLogService.LogAsync(
                    GetCurrentTenantId(),
                    adminId,
                    GetCurrentUserEmail(),
                    "RejectUser",
                    "User",
                    id,
                    $"User registration {id} rejected by admin {adminId}"
                );
                return Ok(res);
            }
            return BadRequest(res);
        }

        [Authorize(Roles = "Admin,Supervisor")]
        [HttpGet("get-all-users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var res = await _userService.GetAllAsync();
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }

        [Authorize(Roles = "Admin,Supervisor")]
        [HttpPost("users/{id}/make-staff")]
        public async Task<IActionResult> MakeStaff(int id)
        {
            var adminId = GetCurrentUserId();
            var res = await _userService.MakeStaffAsync(adminId, id);

            if (res.IsSuccess)
            {
                await _auditLogService.LogAsync(
                    GetCurrentTenantId(),
                    adminId,
                    GetCurrentUserEmail(),
                    "MakeStaff",
                    "User",
                    id,
                    $"User {id} promoted to Staff by admin {adminId}"
                );
                return Ok(res);
            }

            return BadRequest(res);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("delete-user/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var adminId = GetCurrentUserId();
            var res = await _userService.DeleteUserAsync(adminId, id);
            if (res.IsSuccess)
            {
                await _auditLogService.LogAsync(
                    GetCurrentTenantId(),
                    adminId,
                    GetCurrentUserEmail(),
                    "DeleteUser",
                    "User",
                    id,
                    $"User {id} deleted by Admin {adminId}"
                );
                return Ok(res);
            }
            return BadRequest(res);
        }

        [Authorize]
        [HttpGet("get-current-user")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var currentUserId = GetCurrentUserId();
            var res = await _userService.GetUser(currentUserId, true, currentUserId);
            return res.IsSuccess ? Ok(res) : NotFound(res);
        }

        [Authorize]
        [HttpGet("get-user/{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var callerId = GetCurrentUserId();
            var isAdminOrSuper = IsAdminOrSupervisor();
            var res = await _userService.GetUser(callerId, isAdminOrSuper, id);
            return res.IsSuccess ? Ok(res) : (res.Message.StartsWith("Unauthorized") ? Forbid() : NotFound(res));
        }

        /// <summary>
        /// Self-service password change: derives identity strictly from JWT token
        /// </summary>
        [Authorize]
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userId = GetCurrentUserId();
            var res = await _userService.ChangePasswordAsync(userId, dto);
            if (res.IsSuccess)
            {
                await _auditLogService.LogAsync(
                    GetCurrentTenantId(),
                    userId,
                    GetCurrentUserEmail(),
                    "ChangePassword",
                    "User",
                    userId,
                    "User successfully updated their password"
                );
                return Ok(res);
            }
            return BadRequest(res);
        }

        /// <summary>
        /// Administrative password reset: authorized administrators only
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpPost("admin-reset-password")]
        public async Task<IActionResult> AdminResetPassword([FromBody] AdminResetPasswordDto dto)
        {
            var adminId = GetCurrentUserId();
            var res = await _userService.AdminResetPasswordAsync(adminId, dto);
            if (res.IsSuccess)
            {
                await _auditLogService.LogAsync(
                    GetCurrentTenantId(),
                    adminId,
                    GetCurrentUserEmail(),
                    "AdminResetPassword",
                    "User",
                    dto.TargetUserId,
                    $"Administrator reset password for user {dto.TargetUserId}"
                );
                return Ok(res);
            }
            return BadRequest(res);
        }

        /// <summary>
        /// Legacy password update: strictly validates ownership before updating
        /// </summary>
        [Authorize]
        [HttpPut("update-user-password")]
        public async Task<IActionResult> UpdateUserPassword([FromBody] UpdatePasswordDto user)
        {
            var callerId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin") || User.IsInRole("SuperAdmin");
            var res = await _userService.UpdateUserAsync(callerId, isAdmin, user);
            return res.IsSuccess ? Ok(res) : (res.Message.StartsWith("Unauthorized") ? Forbid() : BadRequest(res));
        }

        [AllowAnonymous]
        [EnableRateLimiting("AuthRateLimit")]
        [HttpPost("refresh-tokens")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto refreshTokenRequest)
        {
            var result = await _userService.RefreshTokensAsync(refreshTokenRequest);
            if ((bool)!result.IsSuccess!)
            {
                return Unauthorized(result.Message);
            }
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("assign-role")]
        public async Task<IActionResult> AssignRole([FromBody] AssignUserRolesDto assignUserRolesDto)
        {
            var adminId = GetCurrentUserId();
            var result = await _userService.AssignRolesAsync(adminId, assignUserRolesDto);
            if ((bool)!result.IsSuccess!)
            {
                return BadRequest(result.Message);
            }

            await _auditLogService.LogAsync(
                GetCurrentTenantId(),
                adminId,
                GetCurrentUserEmail(),
                "AssignRole",
                "User",
                assignUserRolesDto.UserId,
                $"Role {assignUserRolesDto.RoleId} assigned to user {assignUserRolesDto.UserId}"
            );

            return Ok(result);
        }

        [Authorize(Roles = "Admin,Supervisor")]
        [HttpGet("get-roles")]
        public async Task<IActionResult> GetRoles()
        {
            var result = await _userService.GetAllRolesAsync();
            if ((bool)!result.IsSuccess!)
            {
                return BadRequest(result.Message);
            }
            return Ok(result);
        }
    }
}
