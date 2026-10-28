using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Data.Enums;
using SmartEcoWaste.Infrastructure.DbContexts;
using SmartEcoWaste.Infrastructure.MultiTenancy;
using SmartEcoWaste.Services.Interfaces;
using SmartEcoWaste.Tests.Infrastructure;
using System;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace SmartEcoWaste.Tests.Notifications
{
    public class NotificationTests : IClassFixture<TestWebApplicationFactory>
    {
        private readonly TestWebApplicationFactory _factory;

        public NotificationTests(TestWebApplicationFactory factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task WhenAdminAssignsTaskToStaffMember_EmailNotificationIsSentToStaff()
        {
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<SmartEcoWasteDbContext>();
            var tenantAccessor = scope.ServiceProvider.GetRequiredService<ITenantContextAccessor>();
            var taskService = scope.ServiceProvider.GetRequiredService<ICollectionTaskService>();
            var mockEmail = scope.ServiceProvider.GetRequiredService<MockEmailService>();

            var testData = await TestDatabaseFixture.InitializeAsync(context, tenantAccessor);
            tenantAccessor.SetTenant(testData.TenantA.Id, isSuperAdmin: false);

            var createDto = new CreateCollectionTaskDto
            {
                BinId = testData.BinA.Id,
                AssignedUserId = testData.StaffA.Id,
                Title = "Morning Commercial Collection Route",
                Instructions = "Empty general waste bin and sanitize latch handle.",
                DueDate = DateTime.UtcNow.AddHours(4)
            };

            var res = await taskService.CreateTaskAsync(createDto);

            Assert.True(res.IsSuccess);
            Assert.Contains(mockEmail.AssignedTasks, t => t.staffEmail == testData.StaffA.Email && t.taskTitle == createDto.Title);
        }

        [Fact]
        public async Task WhenBinIsReported_EmailNotificationIsSentToTenantAdmin()
        {
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<SmartEcoWasteDbContext>();
            var tenantAccessor = scope.ServiceProvider.GetRequiredService<ITenantContextAccessor>();
            var binService = scope.ServiceProvider.GetRequiredService<IBinService>();
            var mockEmail = scope.ServiceProvider.GetRequiredService<MockEmailService>();

            var testData = await TestDatabaseFixture.InitializeAsync(context, tenantAccessor);

            // Clean up any prior reports on BinA2 from preceding test runs
            await context.Reports.IgnoreQueryFilters()
                .Where(r => r.BinId == testData.BinA2.Id)
                .ExecuteDeleteAsync();

            // Report a fresh bin that is not yet reported
            var reportDto = new ReportBinDto
            {
                BinId = testData.BinA2.Id,
                Status = Status.Overflowing,
                PhotoUrl = "/uploads/reports/test-overflow.jpg"
            };

            var res = await binService.ReportBinAsync(testData.UserA.Id, reportDto);

            Assert.True(res.IsSuccess);
            Assert.Contains(mockEmail.ReportedBins, r => r.adminEmail == testData.AdminA.Email && r.status == Status.Overflowing.ToString());
        }

        [Fact]
        public async Task WhenReportIsAssignedToStaff_EmailNotificationIsSentToStaff()
        {
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<SmartEcoWasteDbContext>();
            var tenantAccessor = scope.ServiceProvider.GetRequiredService<ITenantContextAccessor>();
            var reportBinService = scope.ServiceProvider.GetRequiredService<IReportBin>();
            var mockEmail = scope.ServiceProvider.GetRequiredService<MockEmailService>();

            var testData = await TestDatabaseFixture.InitializeAsync(context, tenantAccessor);
            tenantAccessor.SetTenant(testData.TenantA.Id, isSuperAdmin: false);

            var assignDto = new AssignReportDto
            {
                ReportId = testData.ReportA.Id,
                StaffId = testData.StaffA.Id
            };

            var res = await reportBinService.AssignReportAsync(testData.AdminA.Id, assignDto);

            Assert.True(res.IsSuccess);
            Assert.Contains(mockEmail.AssignedTasks, t => t.staffEmail == testData.StaffA.Email);
        }
    }
}
