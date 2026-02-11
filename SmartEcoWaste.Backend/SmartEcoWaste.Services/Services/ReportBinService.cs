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
        public async Task<ServiceResponse<string>> ReportBinAsync(ReportBinDto reportBin)
        {
            var reported = await _smartEcoWasteDbContext.Reports.FirstOrDefaultAsync(b => b.Id == reportBin.BinId && b.Status == Data.Enums.Status.Full);

            if (reported == null)
            {

                var newReport = _mapper.Map<Report>(reportBin);
                await _smartEcoWasteDbContext.Reports.AddAsync(newReport);
                await _smartEcoWasteDbContext.SaveChangesAsync();

                return ServiceResponse<string>.Success(
                    null,
                    "Bin reported successfully"
                );
            }
            else
            {
                return ServiceResponse<string>.Fail(
                    "Bin is already reported as full"
                );
            }
        }
    }
}
