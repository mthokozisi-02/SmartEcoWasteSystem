using Microsoft.AspNetCore.Http;
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

        public async Task InvokeAsync(HttpContext context, ITenantContextAccessor accessor)
        {
            // 1. Check if user is NOT authenticated
            if (!context.User.Identity?.IsAuthenticated ?? true)
            {
                // Fallback: check optional X-Tenant-Id header for public registrations or pre-login queries
                if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var publicHeaderTenantId) &&
                    int.TryParse(publicHeaderTenantId, out var parsedPublicTenantId))
                {
                    accessor.SetTenant(parsedPublicTenantId, false);
                }
                else
                {
                    accessor.SetTenant(0, true);
                }

                await _next(context);
                return;
            }

            // 2. User IS authenticated
            var isSuperAdmin = context.User.IsInRole("SuperAdmin");
            var tenantIdClaim = context.User.FindFirst("TenantId");

            if (tenantIdClaim != null && int.TryParse(tenantIdClaim.Value, out var tenantIdFromClaim))
            {
                accessor.SetTenant(tenantIdFromClaim, isSuperAdmin);
                await _next(context);
                return;
            }

            // If token is missing TenantId claim (e.g. older JWT stored in browser localStorage):
            // Check X-Tenant-Id request header
            if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var headerTenantId) &&
                int.TryParse(headerTenantId, out var parsedHeaderTenantId) && parsedHeaderTenantId > 0)
            {
                accessor.SetTenant(parsedHeaderTenantId, isSuperAdmin);
                await _next(context);
                return;
            }

            // Default safe fallback to workspace 1 (Commercial Mall) instead of crashing with SecurityException
            accessor.SetTenant(1, isSuperAdmin);
            await _next(context);
        }
    }
}
