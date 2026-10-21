using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Data.Entities;
using SmartEcoWaste.Infrastructure.DbContexts;
using SmartEcoWaste.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartEcoWaste.Services.Services
{
    public class ReportBinService(IMapper mapper, SmartEcoWasteDbContext smartEcoWasteDbContext) : IReportBin
    {
        private readonly IMapper _mapper = mapper;
        private readonly SmartEcoWasteDbContext _smartEcoWasteDbContext = smartEcoWasteDbContext;

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
                .Include(r => r.Bin)
                .Include(r => r.User)
                .Include(r => r.VerifyByUser)
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
                })
                .ToListAsync();

            return ServiceResponse<List<GetReportsDto>>.Success(
                reports,
                "Reports retrieved successfully"
            );
        }

        public async Task<ServiceResponse<string>> VerifyReportAsync(int collectorUserId, VerifyBinDto verify)
        {
            var report = await _smartEcoWasteDbContext.Reports
                .FirstOrDefaultAsync(r => r.BinId == verify.BinId && (r.Status == Data.Enums.ReportStatus.Full || r.Status == Data.Enums.ReportStatus.Overflowing || r.Status == Data.Enums.ReportStatus.Damaged) && r.Id == verify.ReportId);

            if (report == null)
            {
                return ServiceResponse<string>.Fail("Report does not exist or does not belong to your organization.");
            }

            // Cross-tenant verification: Ensure collector belongs to the same organization
            var collector = await _smartEcoWasteDbContext.Users
                .FirstOrDefaultAsync(u => u.Id == collectorUserId && !u.IsDeleted);

            if (collector == null)
            {
                return ServiceResponse<string>.Fail("Collector/verifier does not belong to your organization.");
            }

            report.Status = Data.Enums.ReportStatus.Resolved;
            report.VerifiedAt = DateTime.UtcNow;
            report.UpdatedAt = DateTime.UtcNow;
            report.VerifiedBy = collectorUserId;

            var bin = await _smartEcoWasteDbContext.Bins.FindAsync(report.BinId);
            if (bin != null)
            {
                bin.Status = Data.Enums.Status.Emptied;
            }

            // If reported by an authenticated user, award points scoped to this tenant
            if (report.UserId.HasValue && report.UserId.Value > 0)
            {
                var userPoints = await _smartEcoWasteDbContext.UsersPoints
                    .FirstOrDefaultAsync(up => up.UserId == report.UserId.Value && up.TenantId == report.TenantId);

                if (userPoints is null)
                {
                    userPoints = new UserPoints
                    {
                        TenantId = report.TenantId,
                        UserId = report.UserId.Value,
                        Points = 100
                    };

                    await _smartEcoWasteDbContext.UsersPoints.AddAsync(userPoints);
                }
                else
                {
                    userPoints.Points += 100;
                }
            }

            await _smartEcoWasteDbContext.SaveChangesAsync();

            return ServiceResponse<string>.Success("Bin verified successfully.", "Bin verification successful.");
        }
    }
}
