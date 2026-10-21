using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Infrastructure.DbContexts;
using SmartEcoWaste.Infrastructure.MultiTenancy;
using SmartEcoWaste.Services.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SmartEcoWaste.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TenantController : ControllerBase
    {
        private readonly SmartEcoWasteDbContext _context;
        private readonly ITenantContextAccessor _tenantContextAccessor;
        private readonly IAuditLogService _auditLogService;

        public TenantController(SmartEcoWasteDbContext context, ITenantContextAccessor tenantContextAccessor, IAuditLogService auditLogService)
        {
            _context = context;
            _tenantContextAccessor = tenantContextAccessor;
            _auditLogService = auditLogService;
        }

        [HttpGet("public-list")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicTenants()
        {
            var tenants = await _context.Tenants
                .Where(t => !t.IsDeleted && t.IsActive)
                .OrderBy(t => t.Id)
                .Select(t => new TenantDto
                {
                    Id = t.Id,
                    Name = t.Name,
                    Code = t.Code,
                    OrganizationType = t.OrganizationType ?? "CommercialMall",
                    IsActive = t.IsActive
                })
                .ToListAsync();

            return Ok(new { isSuccess = true, data = tenants });
        }

        [HttpGet("current")]
        [Authorize]
        public async Task<IActionResult> GetCurrentTenant()
        {
            var currentTenantId = _tenantContextAccessor.Tenant.TenantId;
            var tenant = await _context.Tenants
                .Where(t => t.Id == currentTenantId)
                .Select(t => new TenantDto
                {
                    Id = t.Id,
                    Name = t.Name,
                    Code = t.Code,
                    OrganizationType = t.OrganizationType ?? "CommercialMall",
                    IsActive = t.IsActive
                })
                .FirstOrDefaultAsync();

            if (tenant == null)
            {
                return NotFound(new { isSuccess = false, message = "Tenant not found." });
            }

            return Ok(new { isSuccess = true, data = tenant });
        }

        /// <summary>
        /// Tenant deactivation guard: deactivating or soft-deleting a tenant never destroys operational records.
        /// </summary>
        [Authorize(Roles = "Admin,SuperAdmin")]
        [HttpPut("toggle-active/{tenantId}")]
        public async Task<IActionResult> ToggleTenantActive(int tenantId, [FromQuery] bool isActive)
        {
            var callerIsSuperAdmin = _tenantContextAccessor.Tenant.IsSuperAdmin;
            if (!callerIsSuperAdmin && _tenantContextAccessor.Tenant.TenantId != tenantId)
            {
                return Forbid();
            }

            var tenant = await _context.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == tenantId && !t.IsDeleted);
            if (tenant == null)
            {
                return NotFound(new { isSuccess = false, message = "Tenant not found." });
            }

            tenant.IsActive = isActive;
            await _context.SaveChangesAsync();

            var callerUserId = int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : 0;
            var callerEmail = User.FindFirst(ClaimTypes.Email)?.Value;

            await _auditLogService.LogAsync(
                tenantId,
                callerUserId,
                callerEmail,
                isActive ? "ActivateTenant" : "DeactivateTenant",
                "Tenant",
                tenantId,
                $"Tenant '{tenant.Name}' active state set to {isActive}"
            );

            return Ok(new { isSuccess = true, message = $"Tenant status updated to {(isActive ? "Active" : "Deactivated")}." });
        }

        [Authorize(Roles = "Admin,Supervisor")]
        [HttpGet("audit-logs")]
        public async Task<IActionResult> GetAuditLogs([FromQuery] PaginationFilterDto filter)
        {
            var res = await _auditLogService.GetAuditLogsAsync(filter);
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }
    }
}
