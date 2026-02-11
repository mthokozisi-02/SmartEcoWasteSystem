using Microsoft.AspNetCore.Mvc;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Data.Entities;
using SmartEcoWaste.Services.Interfaces;

namespace SmartEcoWaste.Api.Controllers
{
    public class BinController(IBinService binService) : Controller
    {
        private readonly IBinService _binService = binService;

        [HttpPost("create-bin")]
        public async Task<IActionResult> CreateBin(CreateBinDto binDto)
        {
            var bytes = await _binService.CreateBinAsync(binDto);

            return File(bytes, "image/png");
        }
    }
}
