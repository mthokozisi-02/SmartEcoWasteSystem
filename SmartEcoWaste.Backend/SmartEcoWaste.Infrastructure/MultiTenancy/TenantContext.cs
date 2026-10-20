namespace SmartEcoWaste.Infrastructure.MultiTenancy
{
    public class TenantContext : ITenantContext
    {
        public int TenantId { get; private set; }
        public bool IsSuperAdmin { get; private set; }

        public TenantContext(int tenantId, bool isSuperAdmin)
        {
            TenantId = tenantId;
            IsSuperAdmin = isSuperAdmin;
        }
    }
}
