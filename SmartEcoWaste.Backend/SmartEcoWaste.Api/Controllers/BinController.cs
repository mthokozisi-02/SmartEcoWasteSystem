using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Services.Interfaces;
using System;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SmartEcoWaste.Api.Controllers
{
    [Route("api/")]
    [ApiController]
    public class BinController(IBinService binService, IWebHostEnvironment environment) : Controller
    {
        private readonly IBinService _binService = binService;
        private readonly IWebHostEnvironment _environment = environment;

        private int? GetAuthenticatedUserId()
        {
            if (User.Identity?.IsAuthenticated == true)
            {
                var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.FindFirst("sub")?.Value
                    ?? User.FindFirst("nameid")?.Value
                    ?? User.FindFirst("id")?.Value;

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
        /// Public / User upload for bin report photo proof.
        /// Rate limited to mitigate spam.
        /// </summary>
        [AllowAnonymous]
        [EnableRateLimiting("PhotoUploadRateLimit")]
        [HttpPost("upload-photo")]
        public async Task<IActionResult> UploadPhoto(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { isSuccess = false, message = "No image file was provided." });
            }

            if (file.Length > 5 * 1024 * 1024)
            {
                return BadRequest(new { isSuccess = false, message = "Image size exceeds 5MB limit." });
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(new { isSuccess = false, message = "Only JPG, PNG, and WebP image formats are supported." });
            }

            // Enforce magic bytes verification: reject arbitrary files masked with an image extension
            using (var checkStream = file.OpenReadStream())
            {
                if (!IsValidImageMagicBytes(checkStream, extension))
                {
                    return BadRequest(new { isSuccess = false, message = "Uploaded file content does not match a valid image format." });
                }
            }

            var rootPath = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsDir = Path.Combine(rootPath, "uploads", "reports");
            if (!Directory.Exists(uploadsDir))
            {
                Directory.CreateDirectory(uploadsDir);
            }

            var uniqueFileName = $"{Guid.NewGuid():N}{extension}";
            var filePath = Path.Combine(uploadsDir, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativeUrl = $"/uploads/reports/{uniqueFileName}";
            return Ok(new { isSuccess = true, data = relativeUrl, message = "Photo uploaded successfully." });
        }

        private static bool IsValidImageMagicBytes(Stream stream, string extension)
        {
            var header = new byte[12];
            var bytesRead = stream.Read(header, 0, header.Length);
            if (stream.CanSeek)
            {
                stream.Position = 0;
            }

            if (bytesRead < 4) return false;

            switch (extension)
            {
                case ".jpg":
                case ".jpeg":
                    // JPEG starts with FF D8 FF
                    return header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF;

                case ".png":
                    // PNG starts with 89 50 4E 47 0D 0A 1A 0A
                    return bytesRead >= 8 &&
                           header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47 &&
                           header[4] == 0x0D && header[5] == 0x0A && header[6] == 0x1A && header[7] == 0x0A;

                case ".webp":
                    // WEBP starts with "RIFF" (52 49 46 46) and bytes 8-11 are "WEBP" (57 45 42 50)
                    return bytesRead >= 12 &&
                           header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46 &&
                           header[8] == 0x57 && header[9] == 0x45 && header[10] == 0x42 && header[11] == 0x50;

                default:
                    return false;
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
            // Security Hardening: Derive reporter identity strictly from validated JWT claims.
            // Client-supplied report.UserId is explicitly ignored to prevent identity spoofing.
            var authenticatedUserId = GetAuthenticatedUserId();
            var res = await _binService.ReportBinAsync(authenticatedUserId, report);
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }
    }
}
