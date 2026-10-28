using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SmartEcoWaste.Data.Entities;
using SmartEcoWaste.Data.Enums;
using SmartEcoWaste.Infrastructure.DbContexts;
using SmartEcoWaste.Infrastructure.MultiTenancy;
using System;
using System.Threading.Tasks;

namespace SmartEcoWaste.Tests.Infrastructure
{
    public class TestData
    {
        public Tenant TenantA { get; set; } = null!;
        public Tenant TenantB { get; set; } = null!;

        public User AdminA { get; set; } = null!;
        public User SupervisorA { get; set; } = null!;
        public User StaffA { get; set; } = null!;
        public User UserA { get; set; } = null!;

        public User AdminB { get; set; } = null!;
        public User SupervisorB { get; set; } = null!;
        public User StaffB { get; set; } = null!;
        public User UserB { get; set; } = null!;

        public User SuperAdmin { get; set; } = null!;

        public Property PropertyA { get; set; } = null!;
        public Property PropertyB { get; set; } = null!;

        public WasteZone ZoneA { get; set; } = null!;
        public WasteZone ZoneB { get; set; } = null!;

        public Bin BinA { get; set; } = null!;
        public Bin BinA2 { get; set; } = null!;
        public Bin BinB { get; set; } = null!;

        public Report ReportA { get; set; } = null!;
        public Report ReportB { get; set; } = null!;

        public CollectionTask TaskA { get; set; } = null!;
        public CollectionTask TaskB { get; set; } = null!;

        public UserPoints PointsA { get; set; } = null!;
        public UserPoints PointsB { get; set; } = null!;
    }

    public static class TestDatabaseFixture
    {
        public static async Task<TestData> InitializeAsync(SmartEcoWasteDbContext context, ITenantContextAccessor tenantAccessor)
        {
            tenantAccessor.SetTenant(0, isSuperAdmin: true);
            var hasher = new PasswordHasher<User>();
            var data = new TestData();

            // 1. Ensure Roles exist (including SuperAdmin)
            var adminRole = await context.Roles.IgnoreQueryFilters().FirstOrDefaultAsync(r => r.Name == "Admin");
            if (adminRole == null)
            {
                adminRole = new Role { Name = "Admin", CreatedAt = DateTime.UtcNow };
                context.Roles.Add(adminRole);
            }

            var userRole = await context.Roles.IgnoreQueryFilters().FirstOrDefaultAsync(r => r.Name == "User");
            if (userRole == null)
            {
                userRole = new Role { Name = "User", CreatedAt = DateTime.UtcNow };
                context.Roles.Add(userRole);
            }

            var staffRole = await context.Roles.IgnoreQueryFilters().FirstOrDefaultAsync(r => r.Name == "Staff");
            if (staffRole == null)
            {
                staffRole = new Role { Name = "Staff", CreatedAt = DateTime.UtcNow };
                context.Roles.Add(staffRole);
            }

            var superAdminRole = await context.Roles.IgnoreQueryFilters().FirstOrDefaultAsync(r => r.Name == "SuperAdmin");
            if (superAdminRole == null)
            {
                superAdminRole = new Role { Name = "SuperAdmin", CreatedAt = DateTime.UtcNow };
                context.Roles.Add(superAdminRole);
            }

            var supervisorRole = await context.Roles.IgnoreQueryFilters().FirstOrDefaultAsync(r => r.Name == "Supervisor");
            if (supervisorRole == null)
            {
                supervisorRole = new Role { Name = "Supervisor", CreatedAt = DateTime.UtcNow };
                context.Roles.Add(supervisorRole);
            }

            await context.SaveChangesAsync();

            // 2. Tenants A and B
            data.TenantA = await context.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Code == "TENA-001")
                ?? new Tenant { Name = "Tenant Alpha Corp", Code = "TENA-001", OrganizationType = "CommercialMall", IsActive = true, CreatedAt = DateTime.UtcNow };
            if (data.TenantA.Id == 0) context.Tenants.Add(data.TenantA);

            data.TenantB = await context.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Code == "TENB-001")
                ?? new Tenant { Name = "Tenant Beta Ltd", Code = "TENB-001", OrganizationType = "ResidentialEstate", IsActive = true, CreatedAt = DateTime.UtcNow };
            if (data.TenantB.Id == 0) context.Tenants.Add(data.TenantB);

            await context.SaveChangesAsync();

            // 3. SuperAdmin User (Global context role)
            data.SuperAdmin = await context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == "superadmin@smarteco.com")
                ?? new User
                {
                    TenantId = data.TenantA.Id, // Associated home tenant for entity constraint, but role grants global scope
                    Name = "Global SuperAdmin",
                    Email = "superadmin@smarteco.com",
                    PasswordHash = hasher.HashPassword(null!, "Admin123!"),
                    RoleId = superAdminRole.Id,
                    IsEmailConfirmed = true,
                    IsApproved = true,
                    CreatedAt = DateTime.UtcNow
                };
            if (data.SuperAdmin.Id == 0) context.Users.Add(data.SuperAdmin);

            // 4. Tenant A Users
            data.AdminA = await context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == "admin@tenanta.com")
                ?? new User
                {
                    TenantId = data.TenantA.Id,
                    Name = "Admin Alpha",
                    Email = "admin@tenanta.com",
                    PasswordHash = hasher.HashPassword(null!, "Admin123!"),
                    RoleId = adminRole.Id,
                    IsEmailConfirmed = true,
                    IsApproved = true,
                    CreatedAt = DateTime.UtcNow
                };
            if (data.AdminA.Id == 0) context.Users.Add(data.AdminA);

            data.SupervisorA = await context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == "supervisor@tenanta.com")
                ?? new User
                {
                    TenantId = data.TenantA.Id,
                    Name = "Supervisor Alpha",
                    Email = "supervisor@tenanta.com",
                    PasswordHash = hasher.HashPassword(null!, "Admin123!"),
                    RoleId = supervisorRole.Id,
                    IsEmailConfirmed = true,
                    IsApproved = true,
                    CreatedAt = DateTime.UtcNow
                };
            if (data.SupervisorA.Id == 0) context.Users.Add(data.SupervisorA);

            data.StaffA = await context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == "staff@tenanta.com")
                ?? new User
                {
                    TenantId = data.TenantA.Id,
                    Name = "Staff Alpha",
                    Email = "staff@tenanta.com",
                    PasswordHash = hasher.HashPassword(null!, "Admin123!"),
                    RoleId = staffRole.Id,
                    IsEmailConfirmed = true,
                    IsApproved = true,
                    CreatedAt = DateTime.UtcNow
                };
            if (data.StaffA.Id == 0) context.Users.Add(data.StaffA);

            data.UserA = await context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == "citizen@tenanta.com")
                ?? new User
                {
                    TenantId = data.TenantA.Id,
                    Name = "Citizen Alpha",
                    Email = "citizen@tenanta.com",
                    PasswordHash = hasher.HashPassword(null!, "Admin123!"),
                    RoleId = userRole.Id,
                    IsEmailConfirmed = true,
                    IsApproved = true,
                    CreatedAt = DateTime.UtcNow
                };
            if (data.UserA.Id == 0) context.Users.Add(data.UserA);

            // 5. Tenant B Users
            data.AdminB = await context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == "admin@tenantb.com")
                ?? new User
                {
                    TenantId = data.TenantB.Id,
                    Name = "Admin Beta",
                    Email = "admin@tenantb.com",
                    PasswordHash = hasher.HashPassword(null!, "Admin123!"),
                    RoleId = adminRole.Id,
                    IsEmailConfirmed = true,
                    IsApproved = true,
                    CreatedAt = DateTime.UtcNow
                };
            if (data.AdminB.Id == 0) context.Users.Add(data.AdminB);

            data.SupervisorB = await context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == "supervisor@tenantb.com")
                ?? new User
                {
                    TenantId = data.TenantB.Id,
                    Name = "Supervisor Beta",
                    Email = "supervisor@tenantb.com",
                    PasswordHash = hasher.HashPassword(null!, "Admin123!"),
                    RoleId = supervisorRole.Id,
                    IsEmailConfirmed = true,
                    IsApproved = true,
                    CreatedAt = DateTime.UtcNow
                };
            if (data.SupervisorB.Id == 0) context.Users.Add(data.SupervisorB);

            data.StaffB = await context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == "staff@tenantb.com")
                ?? new User
                {
                    TenantId = data.TenantB.Id,
                    Name = "Staff Beta",
                    Email = "staff@tenantb.com",
                    PasswordHash = hasher.HashPassword(null!, "Admin123!"),
                    RoleId = staffRole.Id,
                    IsEmailConfirmed = true,
                    IsApproved = true,
                    CreatedAt = DateTime.UtcNow
                };
            if (data.StaffB.Id == 0) context.Users.Add(data.StaffB);

            data.UserB = await context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == "citizen@tenantb.com")
                ?? new User
                {
                    TenantId = data.TenantB.Id,
                    Name = "Citizen Beta",
                    Email = "citizen@tenantb.com",
                    PasswordHash = hasher.HashPassword(null!, "Admin123!"),
                    RoleId = userRole.Id,
                    IsEmailConfirmed = true,
                    IsApproved = true,
                    CreatedAt = DateTime.UtcNow
                };
            if (data.UserB.Id == 0) context.Users.Add(data.UserB);

            await context.SaveChangesAsync();

            // 6. Properties, Buildings & Zones for Tenant A
            data.PropertyA = await context.Properties.IgnoreQueryFilters().FirstOrDefaultAsync(p => p.TenantId == data.TenantA.Id && p.Code == "PROP-TENA")
                ?? new Property
                {
                    TenantId = data.TenantA.Id,
                    Name = "Alpha Commercial Mall",
                    Code = "PROP-TENA",
                    Type = PropertyType.CommercialMall,
                    Address = "100 Alpha Boulevard",
                    CreatedAt = DateTime.UtcNow
                };
            if (data.PropertyA.Id == 0) context.Properties.Add(data.PropertyA);
            await context.SaveChangesAsync();

            var buildingA = await context.Buildings.IgnoreQueryFilters().FirstOrDefaultAsync(b => b.TenantId == data.TenantA.Id && b.Code == "BLD-TENA")
                ?? new Building
                {
                    TenantId = data.TenantA.Id,
                    PropertyId = data.PropertyA.Id,
                    Name = "Main Alpha Wing",
                    Code = "BLD-TENA",
                    NumberOfFloors = 4,
                    CreatedAt = DateTime.UtcNow
                };
            if (buildingA.Id == 0) context.Buildings.Add(buildingA);
            await context.SaveChangesAsync();

            data.ZoneA = await context.WasteZones.IgnoreQueryFilters().FirstOrDefaultAsync(z => z.TenantId == data.TenantA.Id && z.Name == "Alpha Food Court Station")
                ?? new WasteZone
                {
                    TenantId = data.TenantA.Id,
                    PropertyId = data.PropertyA.Id,
                    BuildingId = buildingA.Id,
                    Name = "Alpha Food Court Station",
                    FloorLevel = "1",
                    Description = "Central recycling hub",
                    CreatedAt = DateTime.UtcNow
                };
            if (data.ZoneA.Id == 0) context.WasteZones.Add(data.ZoneA);
            await context.SaveChangesAsync();

            // 7. Properties, Buildings & Zones for Tenant B
            data.PropertyB = await context.Properties.IgnoreQueryFilters().FirstOrDefaultAsync(p => p.TenantId == data.TenantB.Id && p.Code == "PROP-TENB")
                ?? new Property
                {
                    TenantId = data.TenantB.Id,
                    Name = "Beta Residential Estate",
                    Code = "PROP-TENB",
                    Type = PropertyType.ResidentialEstate,
                    Address = "200 Beta Lane",
                    CreatedAt = DateTime.UtcNow
                };
            if (data.PropertyB.Id == 0) context.Properties.Add(data.PropertyB);
            await context.SaveChangesAsync();

            var buildingB = await context.Buildings.IgnoreQueryFilters().FirstOrDefaultAsync(b => b.TenantId == data.TenantB.Id && b.Code == "BLD-TENB")
                ?? new Building
                {
                    TenantId = data.TenantB.Id,
                    PropertyId = data.PropertyB.Id,
                    Name = "Beta Tower 1",
                    Code = "BLD-TENB",
                    NumberOfFloors = 10,
                    CreatedAt = DateTime.UtcNow
                };
            if (buildingB.Id == 0) context.Buildings.Add(buildingB);
            await context.SaveChangesAsync();

            data.ZoneB = await context.WasteZones.IgnoreQueryFilters().FirstOrDefaultAsync(z => z.TenantId == data.TenantB.Id && z.Name == "Beta Chute Station")
                ?? new WasteZone
                {
                    TenantId = data.TenantB.Id,
                    PropertyId = data.PropertyB.Id,
                    BuildingId = buildingB.Id,
                    Name = "Beta Chute Station",
                    FloorLevel = "Ground",
                    Description = "Ground refuse bay",
                    CreatedAt = DateTime.UtcNow
                };
            if (data.ZoneB.Id == 0) context.WasteZones.Add(data.ZoneB);
            await context.SaveChangesAsync();

            // 8. Bins
            data.BinA = await context.Bins.IgnoreQueryFilters().FirstOrDefaultAsync(b => b.TenantId == data.TenantA.Id && b.BinTag == "BIN-TENA-01")
                ?? new Bin
                {
                    TenantId = data.TenantA.Id,
                    WasteZoneId = data.ZoneA.Id,
                    BinTag = "BIN-TENA-01",
                    Category = WasteCategory.GeneralWaste,
                    CapacityLiters = 240,
                    Status = Status.Emptied,
                    Area = "Alpha Mall Level 1",
                    QrCodeUrl = "http://localhost:4200/report-bin/BIN-TENA-01",
                    CreatedAt = DateTime.UtcNow
                };
            if (data.BinA.Id == 0) context.Bins.Add(data.BinA);

            data.BinA2 = await context.Bins.IgnoreQueryFilters().FirstOrDefaultAsync(b => b.TenantId == data.TenantA.Id && b.BinTag == "BIN-TENA-02")
                ?? new Bin
                {
                    TenantId = data.TenantA.Id,
                    WasteZoneId = data.ZoneA.Id,
                    BinTag = "BIN-TENA-02",
                    Category = WasteCategory.PlasticAndBottles,
                    CapacityLiters = 240,
                    Status = Status.Emptied,
                    Area = "Alpha Mall Level 2",
                    QrCodeUrl = "http://localhost:4200/report-bin/BIN-TENA-02",
                    CreatedAt = DateTime.UtcNow
                };
            if (data.BinA2.Id == 0) context.Bins.Add(data.BinA2);

            data.BinB = await context.Bins.IgnoreQueryFilters().FirstOrDefaultAsync(b => b.TenantId == data.TenantB.Id && b.BinTag == "BIN-TENB-01")
                ?? new Bin
                {
                    TenantId = data.TenantB.Id,
                    WasteZoneId = data.ZoneB.Id,
                    BinTag = "BIN-TENB-01",
                    Category = WasteCategory.PlasticAndBottles,
                    CapacityLiters = 240,
                    Status = Status.Emptied,
                    Area = "Beta Estate Ground",
                    QrCodeUrl = "http://localhost:4200/report-bin/BIN-TENB-01",
                    CreatedAt = DateTime.UtcNow
                };
            if (data.BinB.Id == 0) context.Bins.Add(data.BinB);
            await context.SaveChangesAsync();

            // 9. Reports
            data.ReportA = await context.Reports.IgnoreQueryFilters().FirstOrDefaultAsync(r => r.TenantId == data.TenantA.Id && r.BinId == data.BinA.Id)
                ?? new Report
                {
                    TenantId = data.TenantA.Id,
                    BinId = data.BinA.Id,
                    UserId = data.UserA.Id,
                    Status = ReportStatus.Submitted,
                    PointsAwarded = false,
                    CreatedAt = DateTime.UtcNow
                };
            if (data.ReportA.Id == 0) context.Reports.Add(data.ReportA);

            data.ReportB = await context.Reports.IgnoreQueryFilters().FirstOrDefaultAsync(r => r.TenantId == data.TenantB.Id && r.BinId == data.BinB.Id)
                ?? new Report
                {
                    TenantId = data.TenantB.Id,
                    BinId = data.BinB.Id,
                    UserId = data.UserB.Id,
                    Status = ReportStatus.Submitted,
                    PointsAwarded = false,
                    CreatedAt = DateTime.UtcNow
                };
            if (data.ReportB.Id == 0) context.Reports.Add(data.ReportB);
            await context.SaveChangesAsync();

            // 10. Collection Tasks
            data.TaskA = await context.CollectionTasks.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.TenantId == data.TenantA.Id && t.BinId == data.BinA.Id)
                ?? new CollectionTask
                {
                    TenantId = data.TenantA.Id,
                    BinId = data.BinA.Id,
                    AssignedUserId = data.StaffA.Id,
                    Title = "Empty Alpha Bin 1",
                    Instructions = "Clear before 10 AM",
                    Status = CollectionTaskStatus.Pending,
                    ScheduledAt = DateTime.UtcNow.AddHours(2),
                    DueDate = DateTime.UtcNow.AddHours(4),
                    CreatedAt = DateTime.UtcNow
                };
            if (data.TaskA.Id == 0) context.CollectionTasks.Add(data.TaskA);

            data.TaskB = await context.CollectionTasks.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.TenantId == data.TenantB.Id && t.BinId == data.BinB.Id)
                ?? new CollectionTask
                {
                    TenantId = data.TenantB.Id,
                    BinId = data.BinB.Id,
                    AssignedUserId = data.StaffB.Id,
                    Title = "Empty Beta Bin 1",
                    Instructions = "Check recycling sorting",
                    Status = CollectionTaskStatus.Pending,
                    ScheduledAt = DateTime.UtcNow.AddHours(2),
                    DueDate = DateTime.UtcNow.AddHours(4),
                    CreatedAt = DateTime.UtcNow
                };
            if (data.TaskB.Id == 0) context.CollectionTasks.Add(data.TaskB);
            await context.SaveChangesAsync();

            // 11. User Points
            data.PointsA = await context.UsersPoints.IgnoreQueryFilters().FirstOrDefaultAsync(p => p.TenantId == data.TenantA.Id && p.UserId == data.UserA.Id)
                ?? new UserPoints
                {
                    TenantId = data.TenantA.Id,
                    UserId = data.UserA.Id,
                    Points = 150,
                    CreatedAt = DateTime.UtcNow
                };
            if (data.PointsA.Id == 0) context.UsersPoints.Add(data.PointsA);

            data.PointsB = await context.UsersPoints.IgnoreQueryFilters().FirstOrDefaultAsync(p => p.TenantId == data.TenantB.Id && p.UserId == data.UserB.Id)
                ?? new UserPoints
                {
                    TenantId = data.TenantB.Id,
                    UserId = data.UserB.Id,
                    Points = 250,
                    CreatedAt = DateTime.UtcNow
                };
            if (data.PointsB.Id == 0) context.UsersPoints.Add(data.PointsB);
            await context.SaveChangesAsync();

            return data;
        }
    }
}
