using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using QRCoder;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Data.Entities;
using SmartEcoWaste.Infrastructure.DbContexts;
using SmartEcoWaste.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static QRCoder.PayloadGenerator;

namespace SmartEcoWaste.Services.Services
{
    public class BinService(IMapper mapper, SmartEcoWasteDbContext smartEcoWasteDbContext ) : IBinService
    {
        private readonly IMapper _mapper = mapper;
        private readonly SmartEcoWasteDbContext _smartEcoWasteDbContext = smartEcoWasteDbContext;
        public async Task<ServiceResponse<string>> CreateBinAsync(CreateBinDto binDto)
        {
            using var transaction = await _smartEcoWasteDbContext.Database.BeginTransactionAsync();

            try {
            
                var newBin = _mapper.Map<Bin>(binDto);
                await _smartEcoWasteDbContext.Bins.AddAsync(newBin);
                await _smartEcoWasteDbContext.SaveChangesAsync();

                var url = $"http://localhost:4200/report/{newBin.Id}";
                newBin.QrCodeUrl = url;

                // 4️⃣ Save again to update QrCodeUrl
                await _smartEcoWasteDbContext.SaveChangesAsync();

                var qrCode = CreateQRCode(url);

                await transaction.CommitAsync();

                return ServiceResponse<string>.Success(
                    Convert.ToBase64String(qrCode),
                    "Bin created successfully"
                );  
            }
            catch (Exception ex) {
                await transaction.RollbackAsync();
                return null;
            }
        }

        public byte[] CreateQRCode(string url)
        {
            using var generator = new QRCodeGenerator();
            var data = generator.CreateQrCode(url, QRCodeGenerator.ECCLevel.Q);
            var qrCode = new PngByteQRCode(data);

            return qrCode.GetGraphic(20);
        }

        public async Task<string> DeleteBin(int id)
        {
            var bin = await _smartEcoWasteDbContext.Bins.FindAsync(id);
            if (bin == null)
                throw new Exception("Bin not found.");

            bin.IsDeleted = true;
            await _smartEcoWasteDbContext.SaveChangesAsync();
            return 
                $"{bin.Id} bin deleted successfully";
        }

        public async Task<ServiceResponse<List<BinResponseDto>>> GetAllAync()
        {
            var bins = await _smartEcoWasteDbContext.Bins
                .Where(u => u.IsDeleted == false)
                .ToListAsync();

            var results = _mapper.Map<List<BinResponseDto>>(bins);
            results.ForEach(r =>
            {
                r.QrCode = CreateQRCode(r.QrCodeUrl);
            });

            return ServiceResponse<List<BinResponseDto>>.Success(
                results,
                "Bins retrieved successfully"
            );
        }

        public async Task<ServiceResponse<string>> ReportBinAsync(ReportBinDto report)
        {
            using var transaction = await _smartEcoWasteDbContext.Database.BeginTransactionAsync();

            try
            {
                var bin = await _smartEcoWasteDbContext.Bins.FindAsync(report.BinId);

                if (bin is null)
                    return ServiceResponse<string>.Fail("Bin not found.");

                var IsReported = await _smartEcoWasteDbContext.Reports
                    .Where(r => r.BinId == report.BinId && r.IsDeleted == false && r.Status == Data.Enums.Status.Full)
                    .FirstOrDefaultAsync();

                if (IsReported != null)
                {
                    return ServiceResponse<string>.Fail("Bin is already reported as full.");
                }

                bin.Status = report.Status;

                var newReport = new Report
                {
                    UserId = report.UserId,
                    BinId = report.BinId,
                    Status = report.Status,
                };

                await _smartEcoWasteDbContext.Reports.AddAsync(newReport);

                await _smartEcoWasteDbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                return ServiceResponse<string>.Success(
                    $"Bin {bin.Id} reported as full successfully.",
                    "Points waiting to be approved."
                );
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return ServiceResponse<string>.Fail("Something went wrong while reporting the bin.");
            }
        }

        public async Task<byte[]> UpdateAsync(CreateBinDto updatedBin)
        {
            var bin = await _smartEcoWasteDbContext.Bins.FindAsync(updatedBin.Id);
            if (bin == null)
            {
                throw new Exception("Bin not found.");
            }

            bin.Area = updatedBin.Area;
            bin.Latitude = updatedBin.Latitude;
            bin.Longitude = updatedBin.Longitude;

            await _smartEcoWasteDbContext.SaveChangesAsync();
            var qrCode = CreateQRCode(bin.QrCodeUrl);

            return qrCode;
        }
    }
}
