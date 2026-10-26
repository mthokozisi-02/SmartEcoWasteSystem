using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Services.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartEcoWaste.Services.Interfaces
{
    public interface IReportBin
    {
        Task<ServiceResponse<List<GetReportsDto>>> GetReportsAsync();
        Task<ServiceResponse<string>> VerifyReportAsync(int collectorUserId, VerifyBinDto verify);
        Task<string> DeleteReport(int id);
        Task<ServiceResponse<GraphDataDto>> GetGraphDataAsync();
        Task<ServiceResponse<string>> AssignReportAsync(int currentUserId, AssignReportDto dto);
    }
}
