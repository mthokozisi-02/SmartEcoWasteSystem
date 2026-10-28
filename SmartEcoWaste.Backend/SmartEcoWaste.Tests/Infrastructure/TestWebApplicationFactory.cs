using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SmartEcoWaste.Infrastructure.DbContexts;
using System.Collections.Generic;

namespace SmartEcoWaste.Tests.Infrastructure
{
    public class TestWebApplicationFactory : WebApplicationFactory<Program>
    {
        public const string TestConnectionString = "Server=localhost;Port=3306;Database=smartecowastedb_test;User=root;Password=N02123198t.;";

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");

            builder.ConfigureAppConfiguration((context, configBuilder) =>
            {
                configBuilder.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["ConnectionStrings:DefaultConnection"] = TestConnectionString,
                    ["AppSettings:Token"] = JwtTokenHelper.SigningKey,
                    ["AppSettings:Issuer"] = JwtTokenHelper.Issuer,
                    ["AppSettings:Audience"] = JwtTokenHelper.Audience,
                    ["AppSettings:ExpiryMinutes"] = "60",
                    ["AppSettings:RefreshTokenExpiryDays"] = "7"
                });
            });

            builder.ConfigureServices(services =>
            {
                // Ensure the DbContext is configured for test database
                var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<SmartEcoWasteDbContext>));
                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                services.AddDbContext<SmartEcoWasteDbContext>(options =>
                {
                    options.UseMySql(TestConnectionString, ServerVersion.AutoDetect(TestConnectionString));
                });

                // Mock email service for isolated, deterministic integration tests
                var emailDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(SmartEcoWaste.Services.Interfaces.IEmailService));
                if (emailDescriptor != null)
                {
                    services.Remove(emailDescriptor);
                }
                services.AddSingleton<MockEmailService>();
                services.AddSingleton<SmartEcoWaste.Services.Interfaces.IEmailService>(sp => sp.GetRequiredService<MockEmailService>());
            });
        }
    }
}
