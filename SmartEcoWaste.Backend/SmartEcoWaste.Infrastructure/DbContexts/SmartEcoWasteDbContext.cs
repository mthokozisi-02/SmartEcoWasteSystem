using Microsoft.EntityFrameworkCore;
using SmartEcoWaste.Data.Entities;
using SmartEcoWaste.Infrastructure.MultiTenancy;
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

            // Multi-tenant Global Query Filters
            modelBuilder.Entity<Property>()
                .HasQueryFilter(p => _tenantAccessor == null || _tenantAccessor.Tenant.IsSuperAdmin || p.TenantId == _tenantAccessor.Tenant.TenantId);

            modelBuilder.Entity<Building>()
                .HasQueryFilter(b => _tenantAccessor == null || _tenantAccessor.Tenant.IsSuperAdmin || b.TenantId == _tenantAccessor.Tenant.TenantId);

            modelBuilder.Entity<WasteZone>()
                .HasQueryFilter(w => _tenantAccessor == null || _tenantAccessor.Tenant.IsSuperAdmin || w.TenantId == _tenantAccessor.Tenant.TenantId);

            modelBuilder.Entity<Bin>()
                .HasQueryFilter(b => _tenantAccessor == null || _tenantAccessor.Tenant.IsSuperAdmin || b.TenantId == _tenantAccessor.Tenant.TenantId);

            modelBuilder.Entity<CollectionTask>()
                .HasQueryFilter(t => _tenantAccessor == null || _tenantAccessor.Tenant.IsSuperAdmin || t.TenantId == _tenantAccessor.Tenant.TenantId);

            modelBuilder.Entity<BinInspectionLog>()
                .HasQueryFilter(l => _tenantAccessor == null || _tenantAccessor.Tenant.IsSuperAdmin || l.TenantId == _tenantAccessor.Tenant.TenantId);

            modelBuilder.Entity<Report>()
                .HasQueryFilter(r => _tenantAccessor == null || _tenantAccessor.Tenant.IsSuperAdmin || r.TenantId == _tenantAccessor.Tenant.TenantId);

            modelBuilder.Entity<User>()
                .HasQueryFilter(u => _tenantAccessor == null || _tenantAccessor.Tenant.IsSuperAdmin || u.TenantId == _tenantAccessor.Tenant.TenantId);

            // Relationships
            modelBuilder.Entity<Report>()
                .HasOne(r => r.VerifyByUser)
                .WithMany()
                .HasForeignKey(r => r.VerifiedBy)
                .OnDelete(DeleteBehavior.Restrict);

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
        }

        public override int SaveChanges()
        {
            ApplyTenantId();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            ApplyTenantId();
            return base.SaveChangesAsync(cancellationToken);
        }

        private void ApplyTenantId()
        {
            if (_tenantAccessor == null) return;

            var currentTenant = _tenantAccessor.Tenant;
            if (currentTenant.IsSuperAdmin && currentTenant.TenantId == 0) return;

            foreach (var entry in ChangeTracker.Entries<IMustHaveTenant>())
            {
                if (entry.State == EntityState.Added)
                {
                    if (entry.Entity.TenantId == 0)
                    {
                        entry.Entity.TenantId = currentTenant.TenantId;
                    }
                }
            }
        }
    }
}
