using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Data.Entities;
using SmartEcoWaste.Data.Enums;
using SmartEcoWaste.Infrastructure.DbContexts;
using SmartEcoWaste.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartEcoWaste.Services.Services
{
    public class ReportBinService(
        IMapper mapper,
        SmartEcoWasteDbContext smartEcoWasteDbContext,
        IEmailService emailService,
        IConfiguration configuration) : IReportBin
    {
        private readonly IMapper _mapper = mapper;
        private readonly SmartEcoWasteDbContext _smartEcoWasteDbContext = smartEcoWasteDbContext;
        private readonly IEmailService _emailService = emailService;
        private readonly IConfiguration _configuration = configuration;

        public async Task<string> DeleteReport(int id)
        {
            var report = await _smartEcoWasteDbContext.Reports.FindAsync(id);
            if (report == null)
                throw new Exception("Report not found.");

            report.IsDeleted = true;
            await _smartEcoWasteDbContext.SaveChangesAsync();
            return $"{report.Id} report deleted successfully";
        }

        public async Task<ServiceResponse<GraphDataDto>> GetGraphDataAsync()
        {
            var topUsers = await _smartEcoWasteDbContext.Reports
                .Where(r => r.UserId != null && r.UserId > 0)
                .GroupBy(r => new { r.UserId, r.User!.Name })
                .Select(g => new
                {
                    Username = g.Key.Name,
                    TotalReports = g.Count(),
                    EmptiedCount = g.Count(r => r.Status == Data.Enums.ReportStatus.Emptied),
                    FullCount = g.Count(r => r.Status == Data.Enums.ReportStatus.Full),
                    OverflowingCount = g.Count(r => r.Status == Data.Enums.ReportStatus.Overflowing),
                    DamagedCount = g.Count(r => r.Status == Data.Enums.ReportStatus.Damaged)
                })
                .OrderByDescending(x => x.TotalReports)
                .Take(4)
                .ToListAsync();

            var results = new GraphDataDto
            {
                Users = [.. topUsers.Select(x => x.Username)],
                EmptiedData = [.. topUsers.Select(x => x.EmptiedCount)],
                FullData = [.. topUsers.Select(x => x.FullCount)],
                OverflowingData = [.. topUsers.Select(x => x.OverflowingCount)],
                DamagedData = [.. topUsers.Select(x => x.DamagedCount)],
            };

            return ServiceResponse<GraphDataDto>.Success(
                results,
                "Data retrieved successfully"
            );
        }

        public async Task<ServiceResponse<List<GetReportsDto>>> GetReportsAsync()
        {
            var reports = await _smartEcoWasteDbContext.Reports
                .Where(r => !r.IsDeleted)
                .Include(r => r.Bin)
                .Include(r => r.User)
                .Include(r => r.VerifyByUser)
                .Include(r => r.AssignedUser)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new GetReportsDto
                {
                    Id = r.Id,
                    BinId = r.BinId,
                    BinArea = r.Bin != null ? r.Bin.Area ?? string.Empty : string.Empty,
                    UserId = r.UserId ?? 0,
                    UserName = r.User != null ? r.User.Name : "Anonymous Citizen",
                    Status = r.Status,
                    VerifiedAt = r.VerifiedAt,
                    VerifiedBy = r.VerifyByUser != null ? r.VerifyByUser.Name : string.Empty,
                    CreatedAt = r.CreatedAt,
                    PhotoUrl = r.PhotoUrl,
                    AssignedTo = r.AssignedTo,
                    AssignedUserName = r.AssignedUser != null ? r.AssignedUser.Name : null
                })
                .ToListAsync();

            return ServiceResponse<List<GetReportsDto>>.Success(
                reports,
                "Reports retrieved successfully"
            );
        }

        public async Task<ServiceResponse<string>> AssignReportAsync(int currentUserId, AssignReportDto dto)
        {
            var report = await _smartEcoWasteDbContext.Reports
                .IgnoreQueryFilters()
                .Include(r => r.Bin)
                .FirstOrDefaultAsync(r => r.Id == dto.ReportId && !r.IsDeleted);

            if (report == null)
            {
                return ServiceResponse<string>.Fail("Report not found.");
            }

            var staffUser = await _smartEcoWasteDbContext.Users
                .IgnoreQueryFilters()
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == dto.StaffId && !u.IsDeleted);

            if (staffUser == null)
            {
                return ServiceResponse<string>.Fail("Selected staff user does not exist.");
            }

            if (staffUser.RoleId != 3 && (staffUser.Role == null || !staffUser.Role.Name.Equals("Staff", StringComparison.OrdinalIgnoreCase)))
            {
                return ServiceResponse<string>.Fail("Selected user is not assigned the Staff role.");
            }

            // Security Hardening: Target staff member must belong to the report's authorized tenant
            if (staffUser.TenantId != report.TenantId)
            {
                return ServiceResponse<string>.Fail("Target staff member does not belong to the report's organization.");
            }

            report.AssignedTo = staffUser.Id;
            report.Status = Data.Enums.ReportStatus.Assigned;
            report.UpdatedAt = DateTime.UtcNow;

            // Automatically create a CollectionTask for this reported bin so the staff member sees it in their tasks
            var collectionTask = new CollectionTask
            {
                TenantId = report.TenantId > 0 ? report.TenantId : staffUser.TenantId,
                BinId = report.BinId,
                AssignedUserId = staffUser.Id,
                Title = $"Empty Reported Bin #{report.BinId}",
                Instructions = $"Assigned from citizen report #{report.Id}. Bin condition reported as '{report.Status}'.",
                Status = CollectionTaskStatus.Pending,
                DueDate = DateTime.UtcNow.AddHours(24),
                CreatedAt = DateTime.UtcNow
            };
            _smartEcoWasteDbContext.CollectionTasks.Add(collectionTask);

            await _smartEcoWasteDbContext.SaveChangesAsync();

            // Notify assigned staff member via email
            if (!string.IsNullOrWhiteSpace(staffUser.Email))
            {
                try
                {
                    var bin = report.Bin ?? await _smartEcoWasteDbContext.Bins
                        .IgnoreQueryFilters()
                        .Include(b => b.WasteZone)
                        .ThenInclude(w => w!.Property)
                        .FirstOrDefaultAsync(b => b.Id == report.BinId);

                    var locationParts = new List<string>();
                    if (bin != null)
                    {
                        if (!string.IsNullOrWhiteSpace(bin.Area)) locationParts.Add(bin.Area);
                        if (bin.WasteZone != null)
                        {
                            if (!string.IsNullOrWhiteSpace(bin.WasteZone.Name)) locationParts.Add(bin.WasteZone.Name);
                            if (bin.WasteZone.Property != null && !string.IsNullOrWhiteSpace(bin.WasteZone.Property.Name))
                                locationParts.Add(bin.WasteZone.Property.Name);
                        }
                    }
                    var locationStr = locationParts.Count > 0 ? string.Join(", ", locationParts) : "Reported Bin Location";
                    var binTag = bin != null && !string.IsNullOrWhiteSpace(bin.BinTag) ? bin.BinTag : $"BIN-{report.BinId}";
                    var clientBaseUrl = _configuration["AppSettings:ClientBaseUrl"] ?? "http://localhost:4200";
                    var tasksUrl = $"{clientBaseUrl.TrimEnd('/')}/manage-tasks";

                    _ = _emailService.SendTaskAssignedNotificationAsync(
                        staffUser.Email,
                        staffUser.Name,
                        collectionTask.Title,
                        binTag,
                        locationStr,
                        collectionTask.Instructions,
                        collectionTask.DueDate,
                        tasksUrl
                    );
                }
                catch
                {
                    // Non-blocking notification
                }
            }

            return ServiceResponse<string>.Success(
                "Report assigned successfully",
                $"Report #{report.Id} assigned to {staffUser.Name}. Task has been scheduled."
            );
        }

        public async Task<ServiceResponse<string>> VerifyReportAsync(int collectorUserId, VerifyBinDto verify)
        {
            using var transaction = await _smartEcoWasteDbContext.Database.BeginTransactionAsync();

            try
            {
                var report = await _smartEcoWasteDbContext.Reports
                    .FirstOrDefaultAsync(r => r.Id == verify.ReportId && r.BinId == verify.BinId);

                if (report == null)
                {
                    return ServiceResponse<string>.Fail("Report does not exist or does not belong to your organization.");
                }

                // Guard against concurrent or repeated verification requests
                if (report.Status == Data.Enums.ReportStatus.Resolved ||
                    report.Status == Data.Enums.ReportStatus.Closed ||
                    report.Status == Data.Enums.ReportStatus.Rejected ||
                    report.VerifiedAt.HasValue ||
                    report.PointsAwarded)
                {
                    return ServiceResponse<string>.Fail("Report has already been verified and processed.");
                }

                // Cross-tenant verification: Ensure collector belongs to the same organization as the report (or is SuperAdmin)
                var collector = await _smartEcoWasteDbContext.Users
                    .Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.Id == collectorUserId && !u.IsDeleted);

                var isSuperAdmin = string.Equals(collector?.Role?.Name, "SuperAdmin", StringComparison.OrdinalIgnoreCase);

                if (collector == null || (!isSuperAdmin && collector.TenantId != report.TenantId))
                {
                    return ServiceResponse<string>.Fail("Collector/verifier does not belong to the report's organization.");
                }

                // Validate that the bin belongs to the report's authorized tenant
                var bin = await _smartEcoWasteDbContext.Bins.FirstOrDefaultAsync(b => b.Id == report.BinId && b.TenantId == report.TenantId && !b.IsDeleted);
                if (bin == null)
                {
                    return ServiceResponse<string>.Fail("Associated bin does not exist or does not belong to your organization.");
                }

                report.Status = Data.Enums.ReportStatus.Resolved;
                report.VerifiedAt = DateTime.UtcNow;
                report.UpdatedAt = DateTime.UtcNow;
                report.VerifiedBy = collectorUserId;

                bin.Status = Data.Enums.Status.Emptied;

                // Synchronize open collection tasks for this bin
                var pendingTasks = await _smartEcoWasteDbContext.CollectionTasks
                    .Where(t => t.BinId == report.BinId && t.TenantId == report.TenantId &&
                                (t.Status == CollectionTaskStatus.Pending || t.Status == CollectionTaskStatus.InProgress))
                    .ToListAsync();
                foreach (var t in pendingTasks)
                {
                    t.Status = CollectionTaskStatus.Completed;
                    t.CompletedAt ??= DateTime.UtcNow;
                }

                // Award points only after validating ownership and tenant relationship
                // Security Hardening: Never trust client-supplied verify.UserId. Use strictly verified report.UserId.
                // Recipient and report must belong to the same tenant.
                if (report.UserId.HasValue && report.UserId.Value > 0 && !report.PointsAwarded)
                {
                    var reportingUser = await _smartEcoWasteDbContext.Users
                        .FirstOrDefaultAsync(u => u.Id == report.UserId.Value && !u.IsDeleted);

                    if (reportingUser != null && reportingUser.TenantId == report.TenantId)
                    {
                        var userPoints = await _smartEcoWasteDbContext.UsersPoints
                            .FirstOrDefaultAsync(up => up.UserId == reportingUser.Id && up.TenantId == report.TenantId);

                        if (userPoints is null)
                        {
                            userPoints = new UserPoints
                            {
                                TenantId = report.TenantId,
                                UserId = reportingUser.Id,
                                Points = 100
                            };

                            await _smartEcoWasteDbContext.UsersPoints.AddAsync(userPoints);
                        }
                        else
                        {
                            userPoints.Points += 100;
                        }

                        report.PointsAwarded = true;
                    }
                }

                await _smartEcoWasteDbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                return ServiceResponse<string>.Success("Bin verified successfully.", "Bin verification successful.");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return ServiceResponse<string>.Fail("Something went wrong while verifying the collection report.");
            }
        }
    }
}
