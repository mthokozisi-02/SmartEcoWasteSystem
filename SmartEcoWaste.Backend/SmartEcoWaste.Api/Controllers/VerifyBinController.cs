using Microsoft.AspNetCore.Mvc;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Services.Interfaces;

namespace SmartEcoWaste.Api.Controllers
{
    public class VerifyBinController(IVerifyBinService verifyBinService) : Controller
    {
        private readonly IVerifyBinService _verifyBinService = verifyBinService;

        [HttpPost("verify-bin")]
        public async Task<IActionResult> VerifyBin(VerifyBinDto verify)
        {
            return Ok(await _verifyBinService.VerifyBinAsync(verify));
        }
    }
}
