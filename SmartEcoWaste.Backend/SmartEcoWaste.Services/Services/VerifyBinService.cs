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
    public class VerifyBinService(SmartEcoWasteDbContext smartEcoWasteDbContext) : IVerifyBinService
    {
        private readonly SmartEcoWasteDbContext _smartEcoWasteDbContext = smartEcoWasteDbContext;
        public async Task<ServiceResponse<string>> VerifyBinAsync(VerifyBinDto verify)
        {
            var report = await _smartEcoWasteDbContext.Reports.FirstOrDefaultAsync(r => r.BinId == verify.BinId && r.UserId == verify.UserId && r.Status == Data.Enums.Status.Full);

            if (report != null)
            {
                report.Status = Data.Enums.Status.Emptied;
                report.VerifiedAt = DateTime.UtcNow;
                report.UpdatedAt = DateTime.UtcNow;
                report.VerifiedBy = verify.CollecterId;
                await _smartEcoWasteDbContext.SaveChangesAsync();

                var userPoints = new UserPoints
                {
                    UserId = verify.UserId,
                    Points = 100,
                    CreatedAt = DateTime.UtcNow,
                };

                await _smartEcoWasteDbContext.UsersPoints.AddAsync(userPoints);
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
