using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using QRCoder;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Data.Entities;
using SmartEcoWaste.Data.Enums;
using SmartEcoWaste.Infrastructure.DbContexts;
using SmartEcoWaste.Infrastructure.MultiTenancy;
using SmartEcoWaste.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartEcoWaste.Services.Services
{
    public class BinService(IMapper mapper, SmartEcoWasteDbContext smartEcoWasteDbContext, ITenantContextAccessor tenantAccessor) : IBinService
    {
        private readonly IMapper _mapper = mapper;
        private readonly SmartEcoWasteDbContext _smartEcoWasteDbContext = smartEcoWasteDbContext;
        private readonly ITenantContextAccessor _tenantAccessor = tenantAccessor;

        public async Task<ServiceResponse<string>> CreateBinAsync(CreateBinDto binDto)
        {
            using var transaction = await _smartEcoWasteDbContext.Database.BeginTransactionAsync();

            try
            {
                var currentTenantId = _tenantAccessor.Tenant.TenantId;

                // 1. Validate BinTag
                var binTag = binDto.BinTag?.Trim();
                if (string.IsNullOrWhiteSpace(binTag))
                {
                    return ServiceResponse<string>.Fail("A human-readable Bin Tag (e.g. 'BIN-MALL-01') is required.");
                }

                // Uniqueness of BinTag within the current tenant
                var tagExists = await _smartEcoWasteDbContext.Bins
                    .AnyAsync(b => b.BinTag == binTag && !b.IsDeleted);

                if (tagExists)
                {
                    return ServiceResponse<string>.Fail($"A bin with tag '{binTag}' already exists in your organization.");
                }

                // 2. Validate WasteZone hierarchy if specified
                WasteZone? wasteZone = null;
                if (binDto.WasteZoneId.HasValue && binDto.WasteZoneId.Value > 0)
                {
                    wasteZone = await _smartEcoWasteDbContext.WasteZones
                        .Include(w => w.Property)
                        .Include(w => w.Building)
                        .FirstOrDefaultAsync(w => w.Id == binDto.WasteZoneId.Value && !w.IsDeleted);

                    if (wasteZone == null)
                    {
                        return ServiceResponse<string>.Fail("Specified waste zone does not exist or does not belong to your organization.");
                    }

                    if (wasteZone.TenantId != currentTenantId)
                    {
                        return ServiceResponse<string>.Fail("Cannot assign a bin to a waste zone belonging to another organization.");
                    }
                }

                // 3. Validate capacity and location
                if (binDto.CapacityLiters <= 0)
                {
                    return ServiceResponse<string>.Fail("Bin capacity must be greater than zero.");
                }

                var newBin = new Bin
                {
                    TenantId = currentTenantId,
                    WasteZoneId = binDto.WasteZoneId.HasValue && binDto.WasteZoneId.Value > 0 ? binDto.WasteZoneId : null,
                    BinTag = binTag,
                    Category = binDto.Category,
                    CapacityLiters = binDto.CapacityLiters,
                    Area = binDto.Area?.Trim(),
                    Latitude = binDto.Latitude,
                    Longitude = binDto.Longitude,
                    Status = Status.Emptied
                };

                await _smartEcoWasteDbContext.Bins.AddAsync(newBin);
                await _smartEcoWasteDbContext.SaveChangesAsync();

                var baseUrl = string.IsNullOrWhiteSpace(binDto.Url) ? "http://localhost:4200" : binDto.Url.TrimEnd('/');
                var url = $"{baseUrl}/report/{newBin.Id}";
                newBin.QrCodeUrl = url;

                await _smartEcoWasteDbContext.SaveChangesAsync();

                var qrCode = CreateQRCode(url);

                await transaction.CommitAsync();

                return ServiceResponse<string>.Success(
                    Convert.ToBase64String(qrCode),
                    "Bin created successfully"
                );
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return ServiceResponse<string>.Fail($"Failed to create bin: {ex.Message}");
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
            return $"{bin.Id} bin deleted successfully";
        }

        public async Task<ServiceResponse<List<BinResponseDto>>> GetAllAync()
        {
            var bins = await _smartEcoWasteDbContext.Bins
                .Include(b => b.WasteZone)
                    .ThenInclude(w => w!.Building)
                .Include(b => b.WasteZone)
                    .ThenInclude(w => w!.Property)
                .Where(u => u.IsDeleted == false)
                .OrderByDescending(b => b.CreatedAt)
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

        public async Task<ServiceResponse<PublicBinDto>> GetPublicBinAsync(int id)
        {
            var bin = await _smartEcoWasteDbContext.Bins
                .IgnoreQueryFilters()
                .Where(b => b.Id == id && !b.IsDeleted)
                .Select(b => new PublicBinDto
                {
                    Id = b.Id,
                    BinTag = b.BinTag,
                    Area = b.Area,
                    Latitude = b.Latitude,
                    Longitude = b.Longitude,
                    Status = b.Status,
                    Category = b.Category
                })
                .FirstOrDefaultAsync();

            if (bin == null)
            {
                return ServiceResponse<PublicBinDto>.Fail("Bin not found.");
            }

            return ServiceResponse<PublicBinDto>.Success(bin);
        }

        public async Task<ServiceResponse<string>> ReportBinAsync(int? authenticatedUserId, ReportBinDto report)
        {
            using var transaction = await _smartEcoWasteDbContext.Database.BeginTransactionAsync();

            try
            {
                // Public QR reporting: lookup the bin across tenants using IgnoreQueryFilters
                var bin = await _smartEcoWasteDbContext.Bins
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(b => b.Id == report.BinId && !b.IsDeleted);

                if (bin is null)
                    return ServiceResponse<string>.Fail("Bin not found.");

                // Authorize this operation for the bin's tenant
                _tenantAccessor.SetTenant(bin.TenantId, false);

                var isReported = await _smartEcoWasteDbContext.Reports
                    .IgnoreQueryFilters()
                    .Where(r => r.BinId == report.BinId && r.IsDeleted == false && r.Status != Data.Enums.ReportStatus.Closed && r.Status != Data.Enums.ReportStatus.Rejected && r.Status != Data.Enums.ReportStatus.Resolved)
                    .FirstOrDefaultAsync();

                if (isReported != null)
                {
                    return ServiceResponse<string>.Fail("Bin is already reported as full.");
                }

                bin.Status = report.Status;

                // Derive user identity securely: Ignore client-supplied UserId
                int? actualUserId = null;
                if (authenticatedUserId.HasValue && authenticatedUserId.Value > 0)
                {
                    actualUserId = authenticatedUserId.Value;
                }

                var reportStatus = report.Status switch
                {
                    Status.Emptied => ReportStatus.Emptied,
                    Status.Full => ReportStatus.Full,
                    Status.Overflowing => ReportStatus.Overflowing,
                    Status.Damaged => ReportStatus.Damaged,
                    _ => ReportStatus.Submitted
                };

                var newReport = new Report
                {
                    TenantId = bin.TenantId,
                    UserId = actualUserId,
                    BinId = report.BinId,
                    Status = reportStatus,
                };

                await _smartEcoWasteDbContext.Reports.AddAsync(newReport);
                await _smartEcoWasteDbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                var message = actualUserId.HasValue
                    ? $"Bin {bin.Id} reported as full successfully. Points will be awarded upon collection verification."
                    : $"Bin {bin.Id} reported as full successfully. Thank you for your community report.";

                return ServiceResponse<string>.Success(message, "Report accepted.");
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

            if (!string.IsNullOrWhiteSpace(updatedBin.BinTag))
            {
                var newTag = updatedBin.BinTag.Trim();
                var exists = await _smartEcoWasteDbContext.Bins
                    .AnyAsync(b => b.BinTag == newTag && b.Id != bin.Id && !b.IsDeleted);
                if (exists)
                {
                    throw new Exception($"A bin with tag '{newTag}' already exists in your organization.");
                }
                bin.BinTag = newTag;
            }

            if (updatedBin.WasteZoneId.HasValue)
            {
                if (updatedBin.WasteZoneId.Value > 0)
                {
                    var zone = await _smartEcoWasteDbContext.WasteZones
                        .FirstOrDefaultAsync(w => w.Id == updatedBin.WasteZoneId.Value && !w.IsDeleted);
                    if (zone == null)
                    {
                        throw new Exception("Specified waste zone not found in your organization.");
                    }
                    bin.WasteZoneId = zone.Id;
                }
                else
                {
                    bin.WasteZoneId = null;
                }
            }

            bin.Category = updatedBin.Category;
            if (updatedBin.CapacityLiters > 0)
            {
                bin.CapacityLiters = updatedBin.CapacityLiters;
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
