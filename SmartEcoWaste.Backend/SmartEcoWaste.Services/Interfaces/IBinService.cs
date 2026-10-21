using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Services.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartEcoWaste.Services.Interfaces
{
    public interface IBinService
    {
        Task<ServiceResponse<string>> CreateBinAsync(CreateBinDto binDto);
        Task<string> DeleteBin(int id);
        Task<byte[]> UpdateAsync(CreateBinDto binDto);
        Task<ServiceResponse<string>> ReportBinAsync(int? authenticatedUserId, ReportBinDto report);
        Task<ServiceResponse<List<BinResponseDto>>> GetAllAync();
        Task<ServiceResponse<PublicBinDto>> GetPublicBinAsync(int id);
    }
}
