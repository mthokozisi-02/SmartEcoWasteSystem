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
            return
                $"{report.Id} report deleted successfully";
        }

        public async Task<ServiceResponse<List<GetReportsDto>>> GetReportsAsync()
        {
            var reports = await _smartEcoWasteDbContext.Reports
                .Include(r => r.Bin)
                .Include(r => r.User)
                .Include(r => r.VerifyByUser)
                .Where(r => r.IsDeleted == false)
                .Select(r => new GetReportsDto
                {
                    Id = r.Id,
                    BinId = r.BinId,
                    BinArea = r.Bin!.Area!,
                    UserId = r.UserId,
                    UserName = r.User!.Name,
                    Status = r.Status,
                    VerifiedAt = r.VerifiedAt,
                    VerifiedBy = r.VerifyByUser.Name,
                    CreatedAt = r.CreatedAt,
                })
                .ToListAsync();

            return ServiceResponse<List<GetReportsDto>>.Success(
                reports,
                "reports retrieved successfully"
            );
        }

        public async Task<ServiceResponse<string>> VerifyReportAsync(VerifyBinDto verify)
        {
            var report = await _smartEcoWasteDbContext.Reports.FirstOrDefaultAsync(r => r.BinId == verify.BinId && r.UserId == verify.UserId && r.Status == Data.Enums.Status.Full && r.Id == verify.ReportId);

            if (report != null)
            {
                report.Status = Data.Enums.Status.Emptied;
                report.VerifiedAt = DateTime.UtcNow;
                report.UpdatedAt = DateTime.UtcNow;
                report.VerifiedBy = verify.CollecterId;

                var bin = await _smartEcoWasteDbContext.Bins.FindAsync(report.BinId);
                bin.Status = Data.Enums.Status.Emptied;

                // Get existing user points
                var userPoints = await _smartEcoWasteDbContext.UsersPoints
                    .FirstOrDefaultAsync(up => up.UserId == report.UserId);


                if (userPoints is null)
                {
                    userPoints = new UserPoints
                    {
                        UserId = report.UserId,
                        Points = 100
                    };

                    await _smartEcoWasteDbContext.UsersPoints.AddAsync(userPoints);
                }
                else
                {
                    userPoints.Points += 100;
                }

                await _smartEcoWasteDbContext.SaveChangesAsync();

                return ServiceResponse<string>.Success("Bin verified successfully.", "Bin verification successful.");
            }
            else
            {
                return ServiceResponse<string>.Success(null, "Report does not exist");
            }
        }
    }
}
