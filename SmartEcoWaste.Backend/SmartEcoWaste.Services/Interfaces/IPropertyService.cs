using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Services.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartEcoWaste.Services.Interfaces
{
    public interface IPropertyService
    {
        Task<ServiceResponse<ResponsePropertyDto>> CreatePropertyAsync(CreatePropertyDto dto);
        Task<ServiceResponse<List<ResponsePropertyDto>>> GetAllPropertiesAsync();
        Task<ServiceResponse<ResponsePropertyDto>> GetPropertyByIdAsync(int id);

        Task<ServiceResponse<ResponseBuildingDto>> CreateBuildingAsync(CreateBuildingDto dto);
        Task<ServiceResponse<List<ResponseBuildingDto>>> GetBuildingsByPropertyAsync(int propertyId);

        Task<ServiceResponse<ResponseWasteZoneDto>> CreateWasteZoneAsync(CreateWasteZoneDto dto);
        Task<ServiceResponse<List<ResponseWasteZoneDto>>> GetWasteZonesByPropertyAsync(int propertyId);
    }
}
