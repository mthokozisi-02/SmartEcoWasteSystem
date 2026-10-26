using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Services.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SmartEcoWaste.Api.Controllers
{
    [Route("api/")]
    [ApiController]
    public class ReportController(IReportBin reportBin, IAuditLogService auditLogService) : Controller
    {
        private readonly IReportBin _reportBin = reportBin;
        private readonly IAuditLogService _auditLogService = auditLogService;

        private int GetCurrentUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(idClaim, out var id) ? id : 0;
        }

        private int GetCurrentTenantId()
        {
            var tenantClaim = User.FindFirst("TenantId")?.Value;
            return int.TryParse(tenantClaim, out var id) ? id : 0;
        }

        private string? GetCurrentUserEmail()
        {
            return User.FindFirst(ClaimTypes.Email)?.Value;
        }

        [Authorize(Roles = "Admin,Supervisor,Contractor")]
        [HttpGet("get-all-reports")]
        public async Task<IActionResult> GetAllReports()
        {
            var res = await _reportBin.GetReportsAsync();
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }

        [Authorize(Roles = "Admin,Supervisor")]
        [HttpPost("assign-report")]
        public async Task<IActionResult> AssignReport([FromBody] AssignReportDto dto)
        {
            var adminId = GetCurrentUserId();
            var res = await _reportBin.AssignReportAsync(adminId, dto);

            if (res.IsSuccess)
            {
                await _auditLogService.LogAsync(
                    GetCurrentTenantId(),
                    adminId,
                    GetCurrentUserEmail(),
                    "AssignReport",
                    "Report",
                    dto.ReportId,
                    $"Report {dto.ReportId} assigned to staff user {dto.StaffId}"
                );
                return Ok(res);
            }

            return BadRequest(res);
        }

        /// <summary>
        /// Verified collections: Collector ID is derived strictly from authenticated token claims
        /// </summary>
        [Authorize(Roles = "Admin,Supervisor,Staff,Contractor,SuperAdmin")]
        [HttpPost("verify-report")]
        public async Task<IActionResult> VerifyReport([FromBody] VerifyBinDto verify)
        {
            var collectorId = GetCurrentUserId();
            var res = await _reportBin.VerifyReportAsync(collectorId, verify);

            if (res.IsSuccess)
            {
                await _auditLogService.LogAsync(
                    GetCurrentTenantId(),
                    collectorId,
                    GetCurrentCurrentUserEmail(),
                    "VerifyCollection",
                    "Report",
                    verify.BinId,
                    $"Bin collection verified by user {collectorId}"
                );
                return Ok(res);
            }

            return BadRequest(res);
        }

        private string? GetCurrentCurrentUserEmail() => GetCurrentUserEmail();

        [Authorize(Roles = "Admin")]
        [HttpDelete("delete-report/{id}")]
        public async Task<IActionResult> DeleteReport(int id)
        {
            try
            {
                var message = await _reportBin.DeleteReport(id);
                await _auditLogService.LogAsync(
                    GetCurrentTenantId(),
                    GetCurrentUserId(),
                    GetCurrentUserEmail(),
                    "DeleteReport",
                    "Report",
                    id,
                    $"Report {id} deleted"
                );
                return Ok(new { isSuccess = true, message });
            }
            catch (Exception ex)
            {
                return NotFound(new { isSuccess = false, message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin,Supervisor")]
        [HttpGet("get-graph-data")]
        public async Task<IActionResult> GetAllData()
        {
            var res = await _reportBin.GetGraphDataAsync();
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }
    }
}
