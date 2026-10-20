using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Services.Interfaces;
using System.Threading.Tasks;

namespace SmartEcoWaste.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PropertyController : ControllerBase
    {
        private readonly IPropertyService _propertyService;

        public PropertyController(IPropertyService propertyService)
        {
            _propertyService = propertyService;
        }

        [HttpPost("create-property")]
        public async Task<IActionResult> CreateProperty([FromBody] CreatePropertyDto dto)
        {
            var res = await _propertyService.CreatePropertyAsync(dto);
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }

        [HttpGet("get-all-properties")]
        public async Task<IActionResult> GetAllProperties()
        {
            var res = await _propertyService.GetAllPropertiesAsync();
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }

        [HttpGet("get-property/{id}")]
        public async Task<IActionResult> GetProperty(int id)
        {
            var res = await _propertyService.GetPropertyByIdAsync(id);
            return res.IsSuccess ? Ok(res) : NotFound(res);
        }

        [HttpPost("create-building")]
        public async Task<IActionResult> CreateBuilding([FromBody] CreateBuildingDto dto)
        {
            var res = await _propertyService.CreateBuildingAsync(dto);
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }

        [HttpGet("get-buildings/{propertyId}")]
        public async Task<IActionResult> GetBuildings(int propertyId)
        {
            var res = await _propertyService.GetBuildingsByPropertyAsync(propertyId);
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }

        [HttpPost("create-waste-zone")]
        public async Task<IActionResult> CreateWasteZone([FromBody] CreateWasteZoneDto dto)
        {
            var res = await _propertyService.CreateWasteZoneAsync(dto);
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }

        [HttpGet("get-waste-zones/{propertyId}")]
        public async Task<IActionResult> GetWasteZones(int propertyId)
        {
            var res = await _propertyService.GetWasteZonesByPropertyAsync(propertyId);
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }
    }
}
