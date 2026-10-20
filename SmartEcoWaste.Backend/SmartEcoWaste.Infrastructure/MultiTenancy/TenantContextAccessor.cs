namespace SmartEcoWaste.Infrastructure.MultiTenancy
{
    public class TenantContextAccessor : ITenantContextAccessor
    {
        private ITenantContext? _tenant;

        public ITenantContext Tenant
            => _tenant ?? new TenantContext(0, true); // Fallback to SuperAdmin/system context when outside HTTP request (e.g. Seeder or CLI)

        public void SetTenant(int tenantId, bool isSuperAdmin)
        {
            _tenant = new TenantContext(tenantId, isSuperAdmin);
        }
    }
}
