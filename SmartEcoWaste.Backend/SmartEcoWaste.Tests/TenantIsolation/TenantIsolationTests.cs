using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Data.Entities;
using SmartEcoWaste.Data.Enums;
using SmartEcoWaste.Infrastructure.DbContexts;
using SmartEcoWaste.Tests.Infrastructure;
using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace SmartEcoWaste.Tests.TenantIsolation
{
    public class TenantIsolationTests : IClassFixture<TestWebApplicationFactory>, IAsyncLifetime
    {
        private readonly TestWebApplicationFactory _factory;
        private readonly HttpClient _client;
        private TestData _data = null!;

        public TenantIsolationTests(TestWebApplicationFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
        }

        public async Task InitializeAsync()
        {
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<SmartEcoWasteDbContext>();
            var tenantAccessor = scope.ServiceProvider.GetRequiredService<SmartEcoWaste.Infrastructure.MultiTenancy.ITenantContextAccessor>();
            _data = await TestDatabaseFixture.InitializeAsync(context, tenantAccessor);
        }

        public Task DisposeAsync() => Task.CompletedTask;

        private void SetBearerToken(string token)
        {
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        private string GetToken(User user, string role, Tenant tenant, bool isSuperAdmin = false)
        {
            return JwtTokenHelper.GenerateToken(
                userId: user.Id,
                email: user.Email,
                tenantId: isSuperAdmin ? 0 : tenant.Id,
                role: role,
                tenantCode: tenant?.Code ?? "",
                tenantName: tenant?.Name ?? "",
                isSuperAdmin: isSuperAdmin
            );
        }

        #region 1. Tenant A requests its own bins -> Success

        [Fact]
        public async Task TenantA_RequestsItsOwnBins_ReturnsSuccess()
        {
            // Arrange
            var token = GetToken(_data.AdminA, "Admin", _data.TenantA);
            SetBearerToken(token);

            // Act
            var response = await _client.GetAsync("/api/get-all-bins");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var content = await response.Content.ReadAsStringAsync();
            content.Should().Contain("BIN-TENA-01");
            content.Should().NotContain("BIN-TENB-01");
        }

        #endregion

        #region 2. Tenant A requests Tenant B's bin -> Not found or forbidden

        [Fact]
        public async Task TenantA_RequestsTenantBsBin_ReturnsNotFoundOrForbidden()
        {
            // Arrange
            var token = GetToken(_data.AdminA, "Admin", _data.TenantA);
            SetBearerToken(token);

            // Act
            var response = await _client.GetAsync($"/api/get-bin/{_data.BinB.Id}");

            // Assert: BinB belongs to Tenant B, Tenant A query filter hides it -> NotFound
            response.StatusCode.Should().Match(s => s == HttpStatusCode.NotFound || s == HttpStatusCode.Forbidden || s == HttpStatusCode.BadRequest);
        }

        #endregion

        #region 3. Tenant A updates Tenant B's bin -> Rejected

        [Fact]
        public async Task TenantA_UpdatesTenantBsBin_IsRejected()
        {
            // Arrange
            var token = GetToken(_data.AdminA, "Admin", _data.TenantA);
            SetBearerToken(token);

            var updateDto = new CreateBinDto
            {
                Id = _data.BinB.Id,
                BinTag = "BIN-HACKED",
                Category = WasteCategory.HazardousChemical,
                CapacityLiters = 500,
                WasteZoneId = _data.ZoneA.Id
            };

            var content = new StringContent(JsonConvert.SerializeObject(updateDto), Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PutAsync("/api/update-bin", content);

            // Assert: Update should fail because bin belongs to Tenant B
            response.StatusCode.Should().Match(s => s == HttpStatusCode.BadRequest || s == HttpStatusCode.NotFound || s == HttpStatusCode.Forbidden);
        }

        #endregion

        #region 4. Tenant A deletes Tenant B's report -> Rejected

        [Fact]
        public async Task TenantA_DeletesTenantBsReport_IsRejected()
        {
            // Arrange
            var token = GetToken(_data.AdminA, "Admin", _data.TenantA);
            SetBearerToken(token);

            // Act: Attempt to delete report belonging to Tenant B
            var response = await _client.DeleteAsync($"/api/delete-report/{_data.ReportB.Id}");

            // Assert: Report filter ensures Tenant A cannot view or delete Report B
            response.StatusCode.Should().Match(s => s == HttpStatusCode.NotFound || s == HttpStatusCode.Forbidden || s == HttpStatusCode.BadRequest);
        }

        #endregion

        #region 5. Tenant A assigns a report to Tenant B's staff member -> Rejected

        [Fact]
        public async Task TenantA_AssignsReportToTenantBsStaffMember_IsRejected()
        {
            // Arrange
            var token = GetToken(_data.AdminA, "Admin", _data.TenantA);
            SetBearerToken(token);

            var assignDto = new AssignReportDto
            {
                ReportId = _data.ReportA.Id,
                StaffId = _data.StaffB.Id // Staff member from Tenant B!
            };

            var content = new StringContent(JsonConvert.SerializeObject(assignDto), Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/assign-report", content);

            // Assert: Cross-tenant staff assignment rejected
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            var responseBody = await response.Content.ReadAsStringAsync();
            responseBody.Should().Contain("does not belong to the report's organization");
        }

        #endregion

        #region 6. Tenant A creates a task referencing Tenant B's bin -> Rejected

        [Fact]
        public async Task TenantA_CreatesTaskReferencingTenantBsBin_IsRejected()
        {
            // Arrange
            var token = GetToken(_data.AdminA, "Admin", _data.TenantA);
            SetBearerToken(token);

            var taskDto = new CreateCollectionTaskDto
            {
                BinId = _data.BinB.Id, // Target bin belongs to Tenant B!
                AssignedUserId = _data.StaffA.Id,
                Title = "Illegal cross-tenant task",
                Instructions = "Should be rejected",
                ScheduledAt = DateTime.UtcNow.AddHours(1),
                DueDate = DateTime.UtcNow.AddHours(3)
            };

            var content = new StringContent(JsonConvert.SerializeObject(taskDto), Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/CollectionTask/create-task", content);

            // Assert: Cannot create a task targeting another tenant's bin
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            var body = await response.Content.ReadAsStringAsync();
            body.Should().Contain("not belong to your organization");
        }

        #endregion

        #region 7. Tenant A changes X-Tenant-Id to Tenant B -> Forbidden

        [Fact]
        public async Task TenantA_ChangesXTenantIdHeaderToTenantB_ReturnsForbidden()
        {
            // Arrange: Valid Tenant A token
            var token = GetToken(_data.AdminA, "Admin", _data.TenantA);
            SetBearerToken(token);

            // Spoof header: Tenant A caller sends X-Tenant-Id of Tenant B
            _client.DefaultRequestHeaders.Remove("X-Tenant-Id");
            _client.DefaultRequestHeaders.Add("X-Tenant-Id", _data.TenantB.Id.ToString());

            // Act
            var response = await _client.GetAsync("/api/get-all-bins");

            // Clean up header for subsequent tests
            _client.DefaultRequestHeaders.Remove("X-Tenant-Id");

            // Assert: TenantMiddleware detects header spoofing and rejects with 403 Forbidden
            response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
            var body = await response.Content.ReadAsStringAsync();
            body.Should().Contain("Cross-tenant access forbidden");
        }

        #endregion

        #region 8. Tenant A attempts to modify a record's TenantId in request -> Rejected

        [Fact]
        public async Task TenantA_AttemptsToModifyTenantIdInRequest_IsRejectedOrIgnored()
        {
            // Arrange: Tenant A Admin creates a user but attempts to inject TenantId of Tenant B
            var token = GetToken(_data.AdminA, "Admin", _data.TenantA);
            SetBearerToken(token);

            var newUserDto = new UserDto
            {
                Name = "Spoofed User",
                Email = $"spoofed_{Guid.NewGuid():N}@test.com",
                PasswordHash = "ValidPassword123!",
                TenantId = _data.TenantB.Id // Maliciously target Tenant B
            };

            var content = new StringContent(JsonConvert.SerializeObject(newUserDto), Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/create-user", content);

            // Assert: UserController binds user strictly to caller's authenticated TenantId (_data.TenantA.Id)
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<SmartEcoWasteDbContext>();
            var created = await db.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == newUserDto.Email);
            created.Should().NotBeNull();
            created!.TenantId.Should().Be(_data.TenantA.Id); // TenantId spoof was neutralized!
        }

        #endregion

        #region 9. SuperAdmin accesses an authorized global endpoint -> Success

        [Fact]
        public async Task SuperAdmin_AccessesAuthorizedGlobalEndpoint_ReturnsSuccess()
        {
            // Arrange: SuperAdmin with global context (TenantId = 0, Role = SuperAdmin)
            var token = GetToken(_data.SuperAdmin, "SuperAdmin", null!, isSuperAdmin: true);
            SetBearerToken(token);

            // Act: SuperAdmin calls platform audit logs
            var response = await _client.GetAsync("/api/Tenant/audit-logs?pageNumber=1&pageSize=10");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        #endregion

        #region 10. SuperAdmin switches to an invalid tenant -> Rejected

        [Fact]
        public async Task SuperAdmin_SwitchesToInvalidTenant_ReturnsNotFoundOrRejected()
        {
            // Arrange: SuperAdmin specifies a non-existent Tenant ID
            var token = GetToken(_data.SuperAdmin, "SuperAdmin", null!, isSuperAdmin: true);
            SetBearerToken(token);

            _client.DefaultRequestHeaders.Remove("X-Tenant-Id");
            _client.DefaultRequestHeaders.Add("X-Tenant-Id", "9999999"); // Invalid Tenant ID

            // Act: SuperAdmin toggles status of an invalid tenant
            var response = await _client.PutAsync("/api/Tenant/toggle-active/9999999?isActive=false", new StringContent("{}", Encoding.UTF8, "application/json"));

            // Clean up header
            _client.DefaultRequestHeaders.Remove("X-Tenant-Id");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        #endregion

        #region 11. Public report identity handling: Anonymous report ignores client-supplied UserId

        [Fact]
        public async Task PublicReport_AnonymousWithSpoofedUserId_AssignsAnonymousIdentity()
        {
            // Reset state for BinA2 so it is free of prior test reports
            using (var prepScope = _factory.Services.CreateScope())
            {
                var prepDb = prepScope.ServiceProvider.GetRequiredService<SmartEcoWasteDbContext>();
                await prepDb.Reports.IgnoreQueryFilters().Where(r => r.BinId == _data.BinA2.Id).ExecuteDeleteAsync();
            }

            // Arrange: Anonymous call (no Bearer token)
            _client.DefaultRequestHeaders.Authorization = null;

            var spoofReport = new ReportBinDto
            {
                BinId = _data.BinA2.Id,
                Status = Status.Full,
                UserId = _data.UserA.Id, // Attacker submits another user's ID!
                PhotoUrl = "/uploads/reports/test.jpg"
            };

            var content = new StringContent(JsonConvert.SerializeObject(spoofReport), Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/report-bin", content);
            var responseBody = await response.Content.ReadAsStringAsync();

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK, because: responseBody);

            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<SmartEcoWasteDbContext>();
            var savedReport = await db.Reports
                .IgnoreQueryFilters()
                .OrderByDescending(r => r.CreatedAt)
                .FirstOrDefaultAsync(r => r.BinId == _data.BinA2.Id && r.PhotoUrl == "/uploads/reports/test.jpg");

            savedReport.Should().NotBeNull();
            // CRITICAL: The client-supplied UserId was ignored! Report is anonymous.
            savedReport!.UserId.Should().BeNull();
            savedReport.TenantId.Should().Be(_data.BinA2.TenantId); // Derived strictly from the target bin
        }

        #endregion

        #region 12. File upload validation: Magic bytes validation rejects non-image files

        [Fact]
        public async Task UploadPhoto_NonImageContentWithJpgExtension_ReturnsBadRequest()
        {
            // Arrange: Fake JPEG file containing plain text or malicious script
            using var form = new MultipartFormDataContent();
            var fakeImageBytes = Encoding.UTF8.GetBytes("<?php echo 'malicious payload'; ?> This is not a JPEG!");
            var fileContent = new ByteArrayContent(fakeImageBytes);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
            form.Add(fileContent, "file", "exploit.jpg");

            // Act
            var response = await _client.PostAsync("/api/upload-photo", form);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            var body = await response.Content.ReadAsStringAsync();
            body.Should().Contain("Uploaded file content does not match a valid image format");
        }

        [Fact]
        public async Task UploadPhoto_ValidImageWithMagicBytes_ReturnsSuccess()
        {
            // Arrange: Real JPEG header magic bytes (FF D8 FF E0 ...)
            var validJpegBytes = new byte[] { 0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01 };
            using var form = new MultipartFormDataContent();
            var fileContent = new ByteArrayContent(validJpegBytes);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
            form.Add(fileContent, "file", "photo.jpg");

            // Act
            var response = await _client.PostAsync("/api/upload-photo", form);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var body = await response.Content.ReadAsStringAsync();
            body.Should().Contain("Photo uploaded successfully");

            // Cleanup created file
            try
            {
                var uploadedPath = JObject.Parse(body)["data"]?.ToString();
                if (!string.IsNullOrEmpty(uploadedPath))
                {
                    var webRoot = _factory.Services.GetRequiredService<IWebHostEnvironment>().WebRootPath;
                    var localPath = Path.Combine(webRoot, uploadedPath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
                    if (File.Exists(localPath)) File.Delete(localPath);
                }
            }
            catch { /* best effort cleanup */ }
        }

        #endregion

        #region 13. Refresh token concurrency & replay protection

        [Fact]
        public async Task RefreshToken_RotatedTokenReused_IsRejected()
        {
            // Arrange: Login as AdminA to get initial access and refresh tokens
            var loginDto = new LoginDto
            {
                Email = "admin@tenanta.com",
                PasswordHash = "Admin123!",
                TenantCode = "TENA-001"
            };

            var loginResponse = await _client.PostAsync("/api/user-login",
                new StringContent(JsonConvert.SerializeObject(loginDto), Encoding.UTF8, "application/json"));
            loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var loginContent = await loginResponse.Content.ReadAsStringAsync();
            var tokenData = JObject.Parse(loginContent)["data"]!;
            var initialRefreshToken = tokenData["refreshToken"]!.ToString();

            // Act 1: First refresh succeeds and rotates the refresh token
            var refreshRequest = new RefreshTokenRequestDto { RefreshToken = initialRefreshToken };
            var firstRefreshResponse = await _client.PostAsync("/api/refresh-tokens",
                new StringContent(JsonConvert.SerializeObject(refreshRequest), Encoding.UTF8, "application/json"));

            firstRefreshResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            var firstRefreshContent = await firstRefreshResponse.Content.ReadAsStringAsync();
            var newRefreshToken = JObject.Parse(firstRefreshContent)["data"]!["refreshToken"]!.ToString();
            newRefreshToken.Should().NotBe(initialRefreshToken);

            // Act 2: Replay attack - attempting to reuse the old initialRefreshToken
            var replayResponse = await _client.PostAsync("/api/refresh-tokens",
                new StringContent(JsonConvert.SerializeObject(refreshRequest), Encoding.UTF8, "application/json"));

            // Assert: Replay must be rejected with 401 Unauthorized
            replayResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        #endregion
    }
}
