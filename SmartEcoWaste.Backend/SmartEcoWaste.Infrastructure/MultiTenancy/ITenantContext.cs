namespace SmartEcoWaste.Infrastructure.MultiTenancy
{
    public interface ITenantContext
    {
        int TenantId { get; }
        bool IsSuperAdmin { get; }
    }
}
