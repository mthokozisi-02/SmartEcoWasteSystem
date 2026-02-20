using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Services.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartEcoWaste.Services.Interfaces
{
    public interface IReportBin
    {
        Task<ServiceResponse<List<GetReportsDto>>> GetReportsAsync();
        Task<ServiceResponse<string>> VerifyReportAsync(VerifyBinDto verify);
        Task<string> DeleteReport(int id);
        Task<ServiceResponse<GraphDataDto>> GetGraphDataAsync();
    }
}
