using Microsoft.EntityFrameworkCore;
using SmartEcoWaste.Data.Entities;
using SmartEcoWaste.Infrastructure.MultiTenancy;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace SmartEcoWaste.Infrastructure.DbContexts
{
    public class SmartEcoWasteDbContext : DbContext
    {
        private readonly ITenantContextAccessor? _tenantAccessor;

        public SmartEcoWasteDbContext(DbContextOptions<SmartEcoWasteDbContext> options) 
            : base(options)
        { }

        public SmartEcoWasteDbContext(
            DbContextOptions<SmartEcoWasteDbContext> options,
            ITenantContextAccessor tenantAccessor) 
            : base(options)
        {
            _tenantAccessor = tenantAccessor;
        }

        public DbSet<Tenant> Tenants => Set<Tenant>();
        public DbSet<Property> Properties => Set<Property>();
        public DbSet<Building> Buildings => Set<Building>();
        public DbSet<WasteZone> WasteZones => Set<WasteZone>();
        public DbSet<Bin> Bins => Set<Bin>();
        public DbSet<CollectionTask> CollectionTasks => Set<CollectionTask>();
        public DbSet<BinInspectionLog> BinInspectionLogs => Set<BinInspectionLog>();
        public DbSet<User> Users => Set<User>();
        public DbSet<UserPoints> UsersPoints => Set<UserPoints>();
        public DbSet<Redemption> Redemptions => Set<Redemption>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<Report> Reports => Set<Report>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Tenant unique constraints
            modelBuilder.Entity<Tenant>()
                .HasIndex(t => t.Code)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Tenant-specific business identifier uniqueness constraints
            modelBuilder.Entity<Property>()
                .HasIndex(p => new { p.TenantId, p.Code })
                .IsUnique();

            modelBuilder.Entity<Bin>()
                .HasIndex(b => new { b.TenantId, b.BinTag })
                .IsUnique();

            // 1. Consistent Soft Deletion & Tenant Isolation Global Query Filters
            // Every entity with IsDeleted is filtered by !e.IsDeleted by default.
            // Tenant-scoped entities are strictly filtered by TenantId.
            // When SuperAdmin is scoped to a tenant (TenantId > 0), queries are strictly narrowed to that tenant.
            // When SuperAdmin is in global platform context (TenantId <= 0), platform-wide queries are allowed.
            // Unresolved contexts (TenantId <= 0 && !IsSuperAdmin) safely match 0 records (fail-closed).
            modelBuilder.Entity<Tenant>()
                .HasQueryFilter(t => !t.IsDeleted);

            modelBuilder.Entity<Role>()
                .HasQueryFilter(ro => !ro.IsDeleted);

            modelBuilder.Entity<Property>()
                .HasQueryFilter(p => !p.IsDeleted && _tenantAccessor != null && ((_tenantAccessor.Tenant.TenantId > 0 && p.TenantId == _tenantAccessor.Tenant.TenantId) || (_tenantAccessor.Tenant.TenantId <= 0 && _tenantAccessor.Tenant.IsSuperAdmin)));

            modelBuilder.Entity<Building>()
                .HasQueryFilter(b => !b.IsDeleted && _tenantAccessor != null && ((_tenantAccessor.Tenant.TenantId > 0 && b.TenantId == _tenantAccessor.Tenant.TenantId) || (_tenantAccessor.Tenant.TenantId <= 0 && _tenantAccessor.Tenant.IsSuperAdmin)));

            modelBuilder.Entity<WasteZone>()
                .HasQueryFilter(w => !w.IsDeleted && _tenantAccessor != null && ((_tenantAccessor.Tenant.TenantId > 0 && w.TenantId == _tenantAccessor.Tenant.TenantId) || (_tenantAccessor.Tenant.TenantId <= 0 && _tenantAccessor.Tenant.IsSuperAdmin)));

            modelBuilder.Entity<Bin>()
                .HasQueryFilter(b => !b.IsDeleted && _tenantAccessor != null && ((_tenantAccessor.Tenant.TenantId > 0 && b.TenantId == _tenantAccessor.Tenant.TenantId) || (_tenantAccessor.Tenant.TenantId <= 0 && _tenantAccessor.Tenant.IsSuperAdmin)));

            modelBuilder.Entity<CollectionTask>()
                .HasQueryFilter(t => !t.IsDeleted && _tenantAccessor != null && ((_tenantAccessor.Tenant.TenantId > 0 && t.TenantId == _tenantAccessor.Tenant.TenantId) || (_tenantAccessor.Tenant.TenantId <= 0 && _tenantAccessor.Tenant.IsSuperAdmin)));

            modelBuilder.Entity<BinInspectionLog>()
                .HasQueryFilter(l => !l.IsDeleted && _tenantAccessor != null && ((_tenantAccessor.Tenant.TenantId > 0 && l.TenantId == _tenantAccessor.Tenant.TenantId) || (_tenantAccessor.Tenant.TenantId <= 0 && _tenantAccessor.Tenant.IsSuperAdmin)));

            modelBuilder.Entity<Report>()
                .HasQueryFilter(r => !r.IsDeleted && _tenantAccessor != null && ((_tenantAccessor.Tenant.TenantId > 0 && r.TenantId == _tenantAccessor.Tenant.TenantId) || (_tenantAccessor.Tenant.TenantId <= 0 && _tenantAccessor.Tenant.IsSuperAdmin)));

            modelBuilder.Entity<User>()
                .HasQueryFilter(u => !u.IsDeleted && _tenantAccessor != null && ((_tenantAccessor.Tenant.TenantId > 0 && u.TenantId == _tenantAccessor.Tenant.TenantId) || (_tenantAccessor.Tenant.TenantId <= 0 && _tenantAccessor.Tenant.IsSuperAdmin)));

            modelBuilder.Entity<UserPoints>()
                .HasQueryFilter(up => !up.IsDeleted && _tenantAccessor != null && ((_tenantAccessor.Tenant.TenantId > 0 && up.TenantId == _tenantAccessor.Tenant.TenantId) || (_tenantAccessor.Tenant.TenantId <= 0 && _tenantAccessor.Tenant.IsSuperAdmin)));

            modelBuilder.Entity<Redemption>()
                .HasQueryFilter(rd => !rd.IsDeleted && _tenantAccessor != null && ((_tenantAccessor.Tenant.TenantId > 0 && rd.TenantId == _tenantAccessor.Tenant.TenantId) || (_tenantAccessor.Tenant.TenantId <= 0 && _tenantAccessor.Tenant.IsSuperAdmin)));

            modelBuilder.Entity<AuditLog>()
                .HasQueryFilter(a => !a.IsDeleted && _tenantAccessor != null && ((_tenantAccessor.Tenant.TenantId > 0 && a.TenantId == _tenantAccessor.Tenant.TenantId) || (_tenantAccessor.Tenant.TenantId <= 0 && _tenantAccessor.Tenant.IsSuperAdmin)));

            // Performance & Query Optimization Indexes
            modelBuilder.Entity<Bin>()
                .HasIndex(b => new { b.TenantId, b.Status });

            modelBuilder.Entity<Report>()
                .HasIndex(r => new { r.TenantId, r.Status });

            modelBuilder.Entity<CollectionTask>()
                .HasIndex(t => new { t.TenantId, t.Status });
            modelBuilder.Entity<CollectionTask>()
                .HasIndex(t => new { t.TenantId, t.DueDate });

            modelBuilder.Entity<BinInspectionLog>()
                .HasIndex(l => new { l.TenantId, l.CreatedAt });

            modelBuilder.Entity<AuditLog>()
                .HasIndex(a => new { a.TenantId, a.CreatedAt });
            modelBuilder.Entity<AuditLog>()
                .HasIndex(a => new { a.TenantId, a.Action });

            // Relationships
            modelBuilder.Entity<Report>()
                .HasOne(r => r.VerifyByUser)
                .WithMany()
                .HasForeignKey(r => r.VerifiedBy)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Report>()
                .HasOne(r => r.AssignedUser)
                .WithMany()
                .HasForeignKey(r => r.AssignedTo)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<User>()
                .HasMany(u => u.UserReports)
                .WithOne(r => r.User)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<User>()
                .HasMany(u => u.Points)
                .WithOne(r => r.User)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Property Hierarchy
            modelBuilder.Entity<Property>()
                .HasMany(p => p.Buildings)
                .WithOne(b => b.Property)
                .HasForeignKey(b => b.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Property>()
                .HasMany(p => p.WasteZones)
                .WithOne(w => w.Property)
                .HasForeignKey(w => w.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Building>()
                .HasMany(b => b.WasteZones)
                .WithOne(w => w.Building)
                .HasForeignKey(w => w.BuildingId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<WasteZone>()
                .HasMany(w => w.Bins)
                .WithOne(b => b.WasteZone)
                .HasForeignKey(b => b.WasteZoneId)
                .OnDelete(DeleteBehavior.SetNull);

            // Collection Tasks & Inspections
            modelBuilder.Entity<CollectionTask>()
                .HasOne(t => t.Bin)
                .WithMany(b => b.Tasks)
                .HasForeignKey(t => t.BinId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CollectionTask>()
                .HasOne(t => t.AssignedUser)
                .WithMany()
                .HasForeignKey(t => t.AssignedUserId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<BinInspectionLog>()
                .HasOne(l => l.Bin)
                .WithMany(b => b.InspectionLogs)
                .HasForeignKey(l => l.BinId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<BinInspectionLog>()
                .HasOne(l => l.CollectionTask)
                .WithMany(t => t.InspectionLogs)
                .HasForeignKey(l => l.CollectionTaskId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<BinInspectionLog>()
                .HasOne(l => l.InspectorUser)
                .WithMany()
                .HasForeignKey(l => l.InspectorUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<BinInspectionLog>()
                .HasOne(l => l.ApprovedByUser)
                .WithMany()
                .HasForeignKey(l => l.ApprovedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Tenant Top-level Navigations
            modelBuilder.Entity<Tenant>()
                .HasMany(t => t.Properties)
                .WithOne(p => p.Tenant)
                .HasForeignKey(p => p.TenantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Tenant>()
                .HasMany(t => t.WasteZones)
                .WithOne(w => w.Tenant)
                .HasForeignKey(w => w.TenantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Tenant>()
                .HasMany(t => t.Tasks)
                .WithOne(tk => tk.Tenant)
                .HasForeignKey(tk => tk.TenantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Tenant>()
                .HasMany(t => t.InspectionLogs)
                .WithOne(il => il.Tenant)
                .HasForeignKey(il => il.TenantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Tenant>()
                .HasMany(t => t.UserPoints)
                .WithOne(up => up.Tenant)
                .HasForeignKey(up => up.TenantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Tenant>()
                .HasMany(t => t.Redemptions)
                .WithOne(rd => rd.Tenant)
                .HasForeignKey(rd => rd.TenantId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        public override int SaveChanges()
        {
            EnforceTenantSecurityAndAuditing();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            EnforceTenantSecurityAndAuditing();
            return base.SaveChangesAsync(cancellationToken);
        }

        private void EnforceTenantSecurityAndAuditing()
        {
            var currentTenant = _tenantAccessor?.Tenant ?? TenantContext.Unresolved;

            // 1. Maintain timestamps for all BaseEntity items
            foreach (var entry in ChangeTracker.Entries<BaseEntity>())
            {
                if (entry.State == EntityState.Added)
                {
                    if (entry.Entity.CreatedAt == default)
                    {
                        entry.Entity.CreatedAt = DateTime.UtcNow;
                    }
                }
                else if (entry.State == EntityState.Modified)
                {
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                }
            }

            // 2. Centralized Tenant Isolation & Immutability Enforcement
            foreach (var entry in ChangeTracker.Entries<IMustHaveTenant>())
            {
                var tenantIdProp = entry.Property(nameof(IMustHaveTenant.TenantId));

                // Reject any operation on tenant-scoped entities if the tenant context is unresolved
                if (!currentTenant.IsResolved)
                {
                    throw new InvalidOperationException(
                        $"Tenant context unresolved. Cannot perform '{entry.State}' on tenant-scoped entity '{entry.Entity.GetType().Name}'. " +
                        "An active, validated tenant context or an authorized system/SuperAdmin context is required.");
                }

                if (entry.State == EntityState.Added)
                {
                    if (currentTenant.IsSuperAdmin)
                    {
                        // In SuperAdmin context:
                        // If scoped to a specific tenant (TenantId > 0), enforce that target tenant.
                        if (currentTenant.TenantId > 0)
                        {
                            if (entry.Entity.TenantId > 0 && entry.Entity.TenantId != currentTenant.TenantId)
                            {
                                throw new InvalidOperationException(
                                    $"SuperAdmin context is currently scoped to tenant '{currentTenant.TenantId}', but entity '{entry.Entity.GetType().Name}' has TenantId '{entry.Entity.TenantId}'.");
                            }
                            entry.Entity.TenantId = currentTenant.TenantId;
                        }
                        else
                        {
                            // In global SuperAdmin / System context (TenantId == 0), TenantId must be explicitly specified
                            if (entry.Entity.TenantId <= 0)
                            {
                                throw new InvalidOperationException(
                                    $"TenantId must be explicitly specified when creating tenant-scoped entity '{entry.Entity.GetType().Name}' in a global administrative context.");
                            }
                        }
                    }
                    else
                    {
                        // Standard tenant context: Prevent client request payload tampering
                        if (entry.Entity.TenantId > 0 && entry.Entity.TenantId != currentTenant.TenantId)
                        {
                            throw new InvalidOperationException(
                                $"Cross-tenant creation forbidden. Attempted to create an entity for tenant '{entry.Entity.TenantId}', but active authorized tenant is '{currentTenant.TenantId}'.");
                        }

                        // Always enforce authorized tenant context ID
                        entry.Entity.TenantId = currentTenant.TenantId;
                    }
                }
                else if (entry.State == EntityState.Modified)
                {
                    var originalTenantId = (int)tenantIdProp.OriginalValue!;
                    var currentTenantId = (int)tenantIdProp.CurrentValue!;

                    // Immutable TenantId: Records can never be transferred between tenants
                    if (tenantIdProp.IsModified && originalTenantId != currentTenantId)
                    {
                        throw new InvalidOperationException(
                            $"TenantId is immutable. Entity '{entry.Entity.GetType().Name}' cannot be transferred between tenants.");
                    }

                    // Cross-tenant modification guard
                    if (currentTenant.IsSuperAdmin)
                    {
                        // If SuperAdmin is scoped to a specific tenant, ensure the entity belongs to that tenant
                        if (currentTenant.TenantId > 0 && originalTenantId != currentTenant.TenantId)
                        {
                            throw new InvalidOperationException(
                                $"Cross-tenant modification forbidden. SuperAdmin context is scoped to tenant '{currentTenant.TenantId}', but target record belongs to tenant '{originalTenantId}'.");
                        }
                    }
                    else
                    {
                        // Standard tenant context: can only modify records belonging to active tenant
                        if (originalTenantId != currentTenant.TenantId)
                        {
                            throw new InvalidOperationException(
                                $"Cross-tenant modification forbidden. You cannot modify records belonging to tenant '{originalTenantId}'.");
                        }
                    }
                }
                else if (entry.State == EntityState.Deleted)
                {
                    var originalTenantId = (int)tenantIdProp.OriginalValue!;

                    // Cross-tenant deletion guard
                    if (currentTenant.IsSuperAdmin)
                    {
                        // If SuperAdmin is scoped to a specific tenant, ensure the entity belongs to that tenant
                        if (currentTenant.TenantId > 0 && originalTenantId != currentTenant.TenantId)
                        {
                            throw new InvalidOperationException(
                                $"Cross-tenant deletion forbidden. SuperAdmin context is scoped to tenant '{currentTenant.TenantId}', but target record belongs to tenant '{originalTenantId}'.");
                        }
                    }
                    else
                    {
                        // Standard tenant context: can only delete records belonging to active tenant
                        if (originalTenantId != currentTenant.TenantId)
                        {
                            throw new InvalidOperationException(
                                $"Cross-tenant deletion forbidden. You cannot delete records belonging to tenant '{originalTenantId}'.");
                        }
                    }
                }
            }
        }
    }
}
