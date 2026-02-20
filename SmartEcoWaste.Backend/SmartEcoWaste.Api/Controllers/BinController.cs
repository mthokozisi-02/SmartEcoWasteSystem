using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Data.Entities;
using SmartEcoWaste.Services.Interfaces;
using SmartEcoWaste.Services.Services;

namespace SmartEcoWaste.Api.Controllers
{
    [Route("api/")]
    [ApiController]
    public class BinController(IBinService binService) : Controller
    {
        private readonly IBinService _binService = binService;

        [Authorize(Roles = "Admin")]
        [HttpPost("create-bin")]
        public async Task<IActionResult> CreateBin([FromBody] CreateBinDto binDto)
        {
            return Ok(await _binService.CreateBinAsync(binDto));
        }

        //[Authorize(Roles = "Admin")]
        [HttpGet("get-all-bins")]
        public async Task<IActionResult> GetAllBins()
        {
            return Ok(await _binService.GetAllAync());
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("delete-bin/{id}")]
        public async Task<IActionResult> DeleteBin(int id)
        {
            return Ok(await _binService.DeleteBin(id));
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("update-bin")]
        public async Task<IActionResult> UpdateBin([FromBody] CreateBinDto user)
        {
            return Ok(await _binService.UpdateAsync(user));
        }

        [HttpPost("report-bin")]
        public async Task<IActionResult> ReportBin([FromBody] ReportBinDto report)
        {
            return Ok(await _binService.ReportBinAsync(report));
        }
    }
}
