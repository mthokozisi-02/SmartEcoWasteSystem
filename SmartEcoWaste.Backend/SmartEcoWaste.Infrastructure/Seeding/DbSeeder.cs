using Microsoft.EntityFrameworkCore;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Data.Entities;
using Microsoft.AspNetCore.Identity;
using SmartEcoWaste.Infrastructure.DbContexts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace SmartEcoWaste.Infrastructure.Seeding
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(SmartEcoWasteDbContext context)
        {
            await context.Database.MigrateAsync();

            // 🔹 Seed Roles
            if (!await context.Roles.AnyAsync())
            {
                context.Roles.AddRange(
                    new Role { Name = "Admin" },
                    new Role { Name = "User" }
                );

                await context.SaveChangesAsync();
            }

            // 🔹 Seed Admin User
            if (!await context.Users.AnyAsync(u => u.Email == "admin@smarteco.com"))
            {
                var adminRole = await context.Roles
                    .FirstAsync(r => r.Name == "Admin");

                var adminUser = new User
                {
                    Name = "System Admin",
                    Email = "admin@smarteco.com",
                    PasswordHash = new PasswordHasher<User>()
                        .HashPassword(new User(), "Admin123!"),
                    RoleId = adminRole.Id   // FK to Roles table
                };

                context.Users.Add(adminUser);
                await context.SaveChangesAsync();
            }
        }
    }
}
