using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Services.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SmartEcoWaste.Api.Controllers
{
    [Route("api/")]
    [ApiController]
    public class BinController(IBinService binService) : Controller
    {
        private readonly IBinService _binService = binService;

        private int? GetAuthenticatedUserId()
        {
            if (User.Identity?.IsAuthenticated == true)
            {
                var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (int.TryParse(idClaim, out var id) && id > 0)
                {
                    return id;
                }
            }
            return null;
        }

        [Authorize(Roles = "Admin,Supervisor")]
        [HttpPost("create-bin")]
        public async Task<IActionResult> CreateBin([FromBody] CreateBinDto binDto)
        {
            var res = await _binService.CreateBinAsync(binDto);
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }

        /// <summary>
        /// Protected: Lists all bins within the caller's authorized tenant
        /// </summary>
        [Authorize]
        [HttpGet("get-all-bins")]
        public async Task<IActionResult> GetAllBins()
        {
            var res = await _binService.GetAllAync();
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }

        /// <summary>
        /// Public QR Workflow: Returns limited public display data for a specific scanned bin
        /// </summary>
        [AllowAnonymous]
        [HttpGet("bin-public/{id}")]
        public async Task<IActionResult> GetPublicBin(int id)
        {
            var res = await _binService.GetPublicBinAsync(id);
            return res.IsSuccess ? Ok(res) : NotFound(res);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("delete-bin/{id}")]
        public async Task<IActionResult> DeleteBin(int id)
        {
            try
            {
                var message = await _binService.DeleteBin(id);
                return Ok(new { isSuccess = true, message });
            }
            catch (Exception ex)
            {
                return NotFound(new { isSuccess = false, message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin,Supervisor")]
        [HttpPut("update-bin")]
        public async Task<IActionResult> UpdateBin([FromBody] CreateBinDto binDto)
        {
            try
            {
                var qrCode = await _binService.UpdateAsync(binDto);
                return Ok(new { isSuccess = true, data = Convert.ToBase64String(qrCode) });
            }
            catch (Exception ex)
            {
                return BadRequest(new { isSuccess = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Public reporting: Accepts report from citizen or authenticated user.
        /// Rate limited to mitigate spam and DOS on public bins.
        /// </summary>
        [AllowAnonymous]
        [EnableRateLimiting("PublicReportRateLimit")]
        [HttpPost("report-bin")]
        public async Task<IActionResult> ReportBin([FromBody] ReportBinDto report)
        {
            var authenticatedUserId = GetAuthenticatedUserId();
            var res = await _binService.ReportBinAsync(authenticatedUserId, report);
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }
    }
}
