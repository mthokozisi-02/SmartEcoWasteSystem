namespace SmartEcoWaste.Infrastructure.MultiTenancy
{
    public interface ITenantContextAccessor
    {
        ITenantContext Tenant { get; }
        void SetTenant(int tenantId, bool isSuperAdmin);
    }
}
