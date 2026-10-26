using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SmartEcoWaste.Data.Entities;
using SmartEcoWaste.Data.Enums;
using SmartEcoWaste.Infrastructure.DbContexts;
using SmartEcoWaste.Infrastructure.MultiTenancy;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SmartEcoWaste.Infrastructure.Seeding
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(SmartEcoWasteDbContext context, ITenantContextAccessor? tenantAccessor = null)
        {
            // Explicitly establish system administrator context for database seeding workflow
            tenantAccessor?.SetTenant(0, isSuperAdmin: true);

            await context.Database.MigrateAsync();

            // 1. Roles
            if (!await context.Roles.AnyAsync())
            {
                context.Roles.AddRange(
                    new Role { Name = "Admin" },
                    new Role { Name = "User" },
                    new Role { Name = "Staff" }
                );
                await context.SaveChangesAsync();
            }
            else if (!await context.Roles.AnyAsync(r => r.Name == "Staff"))
            {
                context.Roles.Add(new Role { Name = "Staff" });
                await context.SaveChangesAsync();
            }

            var adminRole = await context.Roles.FirstAsync(r => r.Name == "Admin");
            var userRole = await context.Roles.FirstAsync(r => r.Name == "User");

            // 2. Tenants
            if (!await context.Tenants.AnyAsync(t => t.Code == "MALL-001"))
            {
                context.Tenants.Add(new Tenant
                {
                    Name = "Grand City Commercial Mall",
                    Code = "MALL-001",
                    OrganizationType = "CommercialMall",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });
            }
            if (!await context.Tenants.AnyAsync(t => t.Code == "RES-001"))
            {
                context.Tenants.Add(new Tenant
                {
                    Name = "Sunset Heights Residential Estate",
                    Code = "RES-001",
                    OrganizationType = "ResidentialEstate",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });
            }
            if (!await context.Tenants.AnyAsync(t => t.Code == "MUN-001"))
            {
                context.Tenants.Add(new Tenant
                {
                    Name = "Central Metro Municipality",
                    Code = "MUN-001",
                    OrganizationType = "Municipality",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });
            }
            await context.SaveChangesAsync();

            var mallTenant = await context.Tenants.FirstAsync(t => t.Code == "MALL-001");
            var resTenant = await context.Tenants.FirstAsync(t => t.Code == "RES-001");
            var munTenant = await context.Tenants.FirstAsync(t => t.Code == "MUN-001");

            // 3. Demo Users for each tenant
            var passwordHasher = new PasswordHasher<User>();
            var demoUsers = new List<User>
            {
                new User
                {
                    Name = "Mall Facilities Director",
                    Email = "admin@smarteco.com",
                    PasswordHash = passwordHasher.HashPassword(new User(), "Admin123!"),
                    RoleId = adminRole.Id,
                    TenantId = mallTenant.Id
                },
                new User
                {
                    Name = "Commercial Ops Manager",
                    Email = "mall.manager@smarteco.com",
                    PasswordHash = passwordHasher.HashPassword(new User(), "Admin123!"),
                    RoleId = adminRole.Id,
                    TenantId = mallTenant.Id
                },
                new User
                {
                    Name = "Estate General Manager",
                    Email = "estate.manager@smarteco.com",
                    PasswordHash = passwordHasher.HashPassword(new User(), "Admin123!"),
                    RoleId = adminRole.Id,
                    TenantId = resTenant.Id
                },
                new User
                {
                    Name = "Municipal Waste Commissioner",
                    Email = "council.manager@smarteco.com",
                    PasswordHash = passwordHasher.HashPassword(new User(), "Admin123!"),
                    RoleId = adminRole.Id,
                    TenantId = munTenant.Id
                }
            };

            foreach (var u in demoUsers)
            {
                var existing = await context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Email == u.Email);
                if (existing == null)
                {
                    context.Users.Add(u);
                }
                else
                {
                    existing.TenantId = u.TenantId;
                    existing.RoleId = u.RoleId;
                }
            }
            await context.SaveChangesAsync();

            // 4. Properties, Buildings & Zones for Mall
            if (!await context.Properties.IgnoreQueryFilters().AnyAsync(p => p.TenantId == mallTenant.Id))
            {
                var mallProp = new Property
                {
                    TenantId = mallTenant.Id,
                    Name = "Grand City Commercial Complex",
                    Code = "PROP-MALL-01",
                    Type = PropertyType.CommercialMall,
                    Address = "450 Retail Boulevard, City Centre",
                    CreatedAt = DateTime.UtcNow
                };
                context.Properties.Add(mallProp);
                await context.SaveChangesAsync();

                var atriumBuilding = new Building
                {
                    TenantId = mallTenant.Id,
                    PropertyId = mallProp.Id,
                    Name = "Main Retail Atrium & Food Pavilion",
                    Code = "BLDG-ATR-01",
                    NumberOfFloors = 4,
                    CreatedAt = DateTime.UtcNow
                };
                context.Buildings.Add(atriumBuilding);
                await context.SaveChangesAsync();

                var zones = new List<WasteZone>
                {
                    new WasteZone { TenantId = mallTenant.Id, PropertyId = mallProp.Id, BuildingId = atriumBuilding.Id, Name = "Level 2 Food Court Compactor", FloorLevel = "L2", Description = "Wet and organic food court waste with hydraulic compactor" },
                    new WasteZone { TenantId = mallTenant.Id, PropertyId = mallProp.Id, BuildingId = atriumBuilding.Id, Name = "Loading Dock B2 (North Logistics)", FloorLevel = "B2", Description = "Cardboard baler, pallet disposal and bulk commercial bins" },
                    new WasteZone { TenantId = mallTenant.Id, PropertyId = mallProp.Id, BuildingId = atriumBuilding.Id, Name = "East Pavilion Waste Chute", FloorLevel = "L1", Description = "General consumer sorting station" }
                };
                context.WasteZones.AddRange(zones);
                await context.SaveChangesAsync();
            }

            // 5. Properties, Buildings & Zones for Residential Estate
            if (!await context.Properties.IgnoreQueryFilters().AnyAsync(p => p.TenantId == resTenant.Id))
            {
                var resProp = new Property
                {
                    TenantId = resTenant.Id,
                    Name = "Sunset Heights Residential Estate",
                    Code = "PROP-RES-01",
                    Type = PropertyType.ResidentialEstate,
                    Address = "12 Sunset Ridge Parkway",
                    CreatedAt = DateTime.UtcNow
                };
                context.Properties.Add(resProp);
                await context.SaveChangesAsync();

                var towerA = new Building
                {
                    TenantId = resTenant.Id,
                    PropertyId = resProp.Id,
                    Name = "Tower A - Ocean Crest",
                    Code = "TOWER-A",
                    NumberOfFloors = 12,
                    CreatedAt = DateTime.UtcNow
                };
                context.Buildings.Add(towerA);
                await context.SaveChangesAsync();

                var zones = new List<WasteZone>
                {
                    new WasteZone { TenantId = resTenant.Id, PropertyId = resProp.Id, BuildingId = towerA.Id, Name = "Block A Central Refuse Chute", FloorLevel = "Ground", Description = "Automated resident disposal chute with fill sensors" },
                    new WasteZone { TenantId = resTenant.Id, PropertyId = resProp.Id, BuildingId = towerA.Id, Name = "Community Recycling & Eco Point", FloorLevel = "Ground", Description = "Separated plastics, glass and paper with reward barcode scanner" },
                    new WasteZone { TenantId = resTenant.Id, PropertyId = resProp.Id, BuildingId = towerA.Id, Name = "Clubhouse & Recreational Bay", FloorLevel = "L1", Description = "Event and pool area waste collection point" }
                };
                context.WasteZones.AddRange(zones);
                await context.SaveChangesAsync();
            }

            // 6. Properties, Buildings & Zones for Municipality
            if (!await context.Properties.IgnoreQueryFilters().AnyAsync(p => p.TenantId == munTenant.Id))
            {
                var munProp = new Property
                {
                    TenantId = munTenant.Id,
                    Name = "Metro Central Municipal District",
                    Code = "PROP-MUN-01",
                    Type = PropertyType.MunicipalWard,
                    Address = "Wards 1 through 5, Metro City",
                    CreatedAt = DateTime.UtcNow
                };
                context.Properties.Add(munProp);
                await context.SaveChangesAsync();

                var civicDepot = new Building
                {
                    TenantId = munTenant.Id,
                    PropertyId = munProp.Id,
                    Name = "Ward 4 Sanitation & Fleet Hub",
                    Code = "DEPOT-W4",
                    NumberOfFloors = 2,
                    CreatedAt = DateTime.UtcNow
                };
                context.Buildings.Add(civicDepot);
                await context.SaveChangesAsync();

                var zones = new List<WasteZone>
                {
                    new WasteZone { TenantId = munTenant.Id, PropertyId = munProp.Id, BuildingId = civicDepot.Id, Name = "Main Street Bus & Transit Hub", FloorLevel = "Street", Description = "High footfall public solar-compacting bin cluster" },
                    new WasteZone { TenantId = munTenant.Id, PropertyId = munProp.Id, BuildingId = civicDepot.Id, Name = "Central Market Square Station", FloorLevel = "Street", Description = "Vendor municipal collection point with daily scale weigh-in" },
                    new WasteZone { TenantId = munTenant.Id, PropertyId = munProp.Id, BuildingId = civicDepot.Id, Name = "Ward 4 Civic Recycling Depot", FloorLevel = "Ground", Description = "Public drop-off facility for e-waste and bulk items" }
                };
                context.WasteZones.AddRange(zones);
                await context.SaveChangesAsync();
            }
        }
    }
}
