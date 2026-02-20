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

            modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

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

        }
    }
}
