using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using SmartEcoWaste.Data.Entities;


namespace SmartEcoWaste.Infrastructure.DbContexts
{
    public class SmartEcoWasteDbContext : DbContext
    {
        public SmartEcoWasteDbContext(DbContextOptions<SmartEcoWasteDbContext> options) : base(options)
        { }
        public DbSet<Bin> Bins => Set<Bin>();
        public DbSet<User> Users => Set<User>();
        public DbSet<UserPoints> UsersPoints => Set<UserPoints>();
        public DbSet<Redemption> Redemptions => Set<Redemption>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<Report> Reports => Set<Report>();


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Configure your entity relationships and mappings here

            
        }
    }
}
