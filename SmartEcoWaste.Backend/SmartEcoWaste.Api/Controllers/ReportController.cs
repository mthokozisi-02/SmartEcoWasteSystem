using Microsoft.AspNetCore.Mvc;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Services.Interfaces;

namespace SmartEcoWaste.Api.Controllers
{
    public class ReportController(IReportBin reportBin) : Controller
    {
        private readonly IReportBin _reportBin = reportBin;

        [HttpPost("report-bin")]
        public async Task<IActionResult> ReportBin(ReportBinDto reportBinDto)
        {
            return Ok(await _reportBin.ReportBinAsync(reportBinDto));
        }

        [HttpGet("get-all-reports")]
        public async Task<IActionResult> GetAllReports()
        {
            return Ok(await _reportBin.GetReportsAsync());
        }
    }
}
