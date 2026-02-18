using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Services.Interfaces;
using SmartEcoWaste.Services.Services;

namespace SmartEcoWaste.Api.Controllers
{
    [Route("api/")]
    [ApiController]
    public class ReportController(IReportBin reportBin) : Controller
    {
        private readonly IReportBin _reportBin = reportBin;


        [Authorize(Roles = "Admin")]
        [HttpGet("get-all-reports")]
        public async Task<IActionResult> GetAllReports()
        {
            return Ok(await _reportBin.GetReportsAsync());
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("verify-report")]
        public async Task<IActionResult> VerifyReport(VerifyBinDto verify)
        {
            return Ok(await _reportBin.VerifyReportAsync(verify));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("delete-report/{id}")]
        public async Task<IActionResult> DeleteReport(int id)
        {
            return Ok(await _reportBin.DeleteReport(id));
        }
    }
}
