using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;

namespace SmartEcoWaste.Api.Controllers
{
    /// <summary>
    /// Handles media uploads such as photos attached to bin reports.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class MediaController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public MediaController(IWebHostEnvironment env)
        {
            _env = env;
        }

        /// <summary>
        /// Receives a single image file and stores it under wwwroot/media.
        /// Returns the public URL of the saved image.
        /// </summary>
        /// <param name="photo">Image file uploaded from the client.</param>
        /// <returns>JSON containing the image URL.</returns>
        [HttpPost("upload-photo")]
        public async Task<IActionResult> UploadPhoto([FromForm] IFormFile photo)
        {
            if (photo == null || photo.Length == 0)
            {
                return BadRequest(new { message = "No file received." });
            }

            // Ensure the media directory exists (wwwroot/media)
            var mediaRoot = Path.Combine(_env.WebRootPath, "media");
            if (!Directory.Exists(mediaRoot))
            {
                Directory.CreateDirectory(mediaRoot);
            }

            // Generate a unique file name to avoid collisions
            var fileExtension = Path.GetExtension(photo.FileName);
            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(mediaRoot, fileName);

            await using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await photo.CopyToAsync(stream);
            }

            // Return the relative URL that can be used by the frontend
            var url = $"/media/{fileName}";
            return Ok(new { url });
        }
    }
}
