using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Infrastructure.DbContexts;
using SmartEcoWaste.Infrastructure.MultiTenancy;

namespace SmartEcoWaste.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TenantController : ControllerBase
    {
        private readonly SmartEcoWasteDbContext _context;
        private readonly ITenantContextAccessor _tenantContextAccessor;

        public TenantController(SmartEcoWasteDbContext context, ITenantContextAccessor tenantContextAccessor)
        {
            _context = context;
            _tenantContextAccessor = tenantContextAccessor;
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
    }
}