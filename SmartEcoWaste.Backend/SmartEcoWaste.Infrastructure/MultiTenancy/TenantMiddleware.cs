using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SmartEcoWaste.Infrastructure.DbContexts;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SmartEcoWaste.Infrastructure.MultiTenancy
{
    public class TenantMiddleware
    {
        private readonly RequestDelegate _next;

        public TenantMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, ITenantContextAccessor accessor, SmartEcoWasteDbContext dbContext)
        {
            // 1. Unauthenticated requests:
            // Fail-closed. Unauthenticated requests must NEVER become SuperAdmin.
            // Under no circumstances does an unauthenticated caller receive cross-tenant access.
            if (!context.User.Identity?.IsAuthenticated ?? true)
            {
                accessor.SetTenant(0, false);
                await _next(context);
                return;
            }

            // 2. Authenticated requests:
            // SuperAdmin access is granted ONLY to an explicitly authenticated user with the SuperAdmin role.
            var isSuperAdmin = context.User.IsInRole("SuperAdmin");

            if (isSuperAdmin)
            {
                // Platform administrators may optionally narrow their view to a specific tenant via X-Tenant-Id
                if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var targetHeader) &&
                    int.TryParse(targetHeader, out var targetTenantId) && targetTenantId > 0)
                {
                    accessor.SetTenant(targetTenantId, true);
                }
                else
                {
                    // Global system administrator context
                    accessor.SetTenant(0, true);
                }

                await _next(context);
                return;
            }

            // Regular authenticated users: Tenant MUST come from validated JWT claims
            var tenantIdClaim = context.User.FindFirst("TenantId");
            if (tenantIdClaim == null || !int.TryParse(tenantIdClaim.Value, out var tenantIdFromClaim) || tenantIdFromClaim <= 0)
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("{\"isSuccess\":false,\"message\":\"Authentication token is missing a valid TenantId claim. Please re-authenticate.\"}");
                return;
            }

            // Prevent header spoofing: If an X-Tenant-Id header is sent, verify it matches the user's assigned TenantId claim
            if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var suppliedHeader) &&
                int.TryParse(suppliedHeader, out var suppliedTenantId) &&
                suppliedTenantId > 0 &&
                suppliedTenantId != tenantIdFromClaim)
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("{\"isSuccess\":false,\"message\":\"Cross-tenant access forbidden. You cannot access an organization other than your assigned tenant.\"}");
                return;
            }

            // Verify that the assigned tenant exists and is active
            var tenant = await dbContext.Tenants.AsNoTracking().FirstOrDefaultAsync(t => t.Id == tenantIdFromClaim);
            if (tenant == null || !tenant.IsActive)
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("{\"isSuccess\":false,\"message\":\"Assigned organization does not exist or has been deactivated.\"}");
                return;
            }

            // Set verified tenant context
            accessor.SetTenant(tenantIdFromClaim, false);
            await _next(context);
        }
    }
}
