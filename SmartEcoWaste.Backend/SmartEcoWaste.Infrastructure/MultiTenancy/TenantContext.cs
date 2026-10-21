namespace SmartEcoWaste.Infrastructure.MultiTenancy
{
    public class TenantContext : ITenantContext
    {
        public int TenantId { get; private set; }
        public bool IsSuperAdmin { get; private set; }
        public bool IsResolved => TenantId > 0 || IsSuperAdmin;

        public TenantContext(int tenantId, bool isSuperAdmin)
        {
            TenantId = tenantId;
            IsSuperAdmin = isSuperAdmin;
        }

        /// <summary>
        /// Explicit fail-closed unresolved context.
        /// Unauthenticated or uninitialized requests have TenantId = 0 and IsSuperAdmin = false.
        /// Global query filters will safely match zero records.
        /// </summary>
        public static TenantContext Unresolved => new(0, false);

        /// <summary>
        /// Explicit system context for background jobs and migrations.
        /// Must be invoked explicitly rather than by default.
        /// </summary>
        public static TenantContext System => new(0, true);
    }
}
