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
            var res = await _userService.CreateAsyc(user);
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }

        [AllowAnonymous]
        [EnableRateLimiting("AuthRateLimit")]
        [HttpPost("user-login")]
        public async Task<IActionResult> Login([FromBody] LoginDto user)
        {
            var res = await _userService.LoginAsync(user);
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }

        [Authorize(Roles = "Admin,Supervisor")]
        [HttpGet("get-all-users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var res = await _userService.GetAllAsync();
            return res.IsSuccess ? Ok(res) : BadRequest(res);
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
