namespace SmartEcoWaste.Infrastructure.MultiTenancy
{
    public class TenantContextAccessor : ITenantContextAccessor
    {
        private ITenantContext? _tenant;

        /// <summary>
        /// Safe fail-closed default: returns Unresolved (TenantId = 0, IsSuperAdmin = false).
        /// Tenant-scoped operations reject or return empty sets without an explicit valid context.
        /// </summary>
        public ITenantContext Tenant
            => _tenant ?? TenantContext.Unresolved;

        public void SetTenant(int tenantId, bool isSuperAdmin)
        {
            _tenant = new TenantContext(tenantId, isSuperAdmin);
        }

        public void SetSystemContext()
        {
            _tenant = TenantContext.System;
        }
    }
}
