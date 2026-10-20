using Microsoft.EntityFrameworkCore;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Data.Entities;
using SmartEcoWaste.Infrastructure.DbContexts;
using SmartEcoWaste.Services.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SmartEcoWaste.Services.Services
{
    public class PropertyService : IPropertyService
    {
        private readonly SmartEcoWasteDbContext _context;

        public PropertyService(SmartEcoWasteDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResponse<ResponsePropertyDto>> CreatePropertyAsync(CreatePropertyDto dto)
        {
            var property = new Property
            {
                Name = dto.Name,
                Code = dto.Code.Trim().ToUpper(),
                Type = dto.Type,
                Address = dto.Address,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude
            };

            _context.Properties.Add(property);
            await _context.SaveChangesAsync();

            var response = new ResponsePropertyDto
            {
                Id = property.Id,
                TenantId = property.TenantId,
                Name = property.Name,
                Code = property.Code,
                Type = property.Type,
                Address = property.Address,
                Latitude = property.Latitude,
                Longitude = property.Longitude,
                BuildingCount = 0,
                WasteZoneCount = 0,
                CreatedAt = property.CreatedAt
            };

            return ServiceResponse<ResponsePropertyDto>.Success(response, "Property created successfully");
        }

        public async Task<ServiceResponse<List<ResponsePropertyDto>>> GetAllPropertiesAsync()
        {
            var properties = await _context.Properties
                .Include(p => p.Buildings)
                .Include(p => p.WasteZones)
                .Select(p => new ResponsePropertyDto
                {
                    Id = p.Id,
                    TenantId = p.TenantId,
                    Name = p.Name,
                    Code = p.Code,
                    Type = p.Type,
                    Address = p.Address,
                    Latitude = p.Latitude,
                    Longitude = p.Longitude,
                    BuildingCount = p.Buildings.Count,
                    WasteZoneCount = p.WasteZones.Count,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();

            return ServiceResponse<List<ResponsePropertyDto>>.Success(properties);
        }

        public async Task<ServiceResponse<ResponsePropertyDto>> GetPropertyByIdAsync(int id)
        {
            var p = await _context.Properties
                .Include(p => p.Buildings)
                .Include(p => p.WasteZones)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (p == null)
            {
                return ServiceResponse<ResponsePropertyDto>.Fail("Property not found");
            }

            var response = new ResponsePropertyDto
            {
                Id = p.Id,
                TenantId = p.TenantId,
                Name = p.Name,
                Code = p.Code,
                Type = p.Type,
                Address = p.Address,
                Latitude = p.Latitude,
                Longitude = p.Longitude,
                BuildingCount = p.Buildings.Count,
                WasteZoneCount = p.WasteZones.Count,
                CreatedAt = p.CreatedAt
            };

            return ServiceResponse<ResponsePropertyDto>.Success(response);
        }

        public async Task<ServiceResponse<ResponseBuildingDto>> CreateBuildingAsync(CreateBuildingDto dto)
        {
            var property = await _context.Properties.FindAsync(dto.PropertyId);
            if (property == null)
            {
                return ServiceResponse<ResponseBuildingDto>.Fail("Parent property does not exist");
            }

            var building = new Building
            {
                PropertyId = dto.PropertyId,
                Name = dto.Name,
                Code = dto.Code,
                NumberOfFloors = dto.NumberOfFloors
            };

            _context.Buildings.Add(building);
            await _context.SaveChangesAsync();

            var response = new ResponseBuildingDto
            {
                Id = building.Id,
                PropertyId = building.PropertyId,
                PropertyName = property.Name,
                Name = building.Name,
                Code = building.Code,
                NumberOfFloors = building.NumberOfFloors
            };

            return ServiceResponse<ResponseBuildingDto>.Success(response, "Building added successfully");
        }

        public async Task<ServiceResponse<List<ResponseBuildingDto>>> GetBuildingsByPropertyAsync(int propertyId)
        {
            var buildings = await _context.Buildings
                .Include(b => b.Property)
                .Where(b => b.PropertyId == propertyId)
                .Select(b => new ResponseBuildingDto
                {
                    Id = b.Id,
                    PropertyId = b.PropertyId,
                    PropertyName = b.Property != null ? b.Property.Name : string.Empty,
                    Name = b.Name,
                    Code = b.Code,
                    NumberOfFloors = b.NumberOfFloors
                })
                .ToListAsync();

            return ServiceResponse<List<ResponseBuildingDto>>.Success(buildings);
        }

        public async Task<ServiceResponse<ResponseWasteZoneDto>> CreateWasteZoneAsync(CreateWasteZoneDto dto)
        {
            var property = await _context.Properties.FindAsync(dto.PropertyId);
            if (property == null)
            {
                return ServiceResponse<ResponseWasteZoneDto>.Fail("Property does not exist");
            }

            Building? building = null;
            if (dto.BuildingId.HasValue)
            {
                building = await _context.Buildings.FindAsync(dto.BuildingId.Value);
                if (building == null || building.PropertyId != dto.PropertyId)
                {
                    return ServiceResponse<ResponseWasteZoneDto>.Fail("Building does not belong to the specified property");
                }
            }

            var zone = new WasteZone
            {
                PropertyId = dto.PropertyId,
                BuildingId = dto.BuildingId,
                Name = dto.Name,
                FloorLevel = dto.FloorLevel,
                Description = dto.Description
            };

            _context.WasteZones.Add(zone);
            await _context.SaveChangesAsync();

            var response = new ResponseWasteZoneDto
            {
                Id = zone.Id,
                PropertyId = zone.PropertyId,
                PropertyName = property.Name,
                BuildingId = zone.BuildingId,
                BuildingName = building?.Name,
                Name = zone.Name,
                FloorLevel = zone.FloorLevel,
                Description = zone.Description,
                BinCount = 0
            };

            return ServiceResponse<ResponseWasteZoneDto>.Success(response, "Waste Zone created successfully");
        }

        public async Task<ServiceResponse<List<ResponseWasteZoneDto>>> GetWasteZonesByPropertyAsync(int propertyId)
        {
            var zones = await _context.WasteZones
                .Include(w => w.Property)
                .Include(w => w.Building)
                .Include(w => w.Bins)
                .Where(w => w.PropertyId == propertyId)
                .Select(w => new ResponseWasteZoneDto
                {
                    Id = w.Id,
                    PropertyId = w.PropertyId,
                    PropertyName = w.Property != null ? w.Property.Name : string.Empty,
                    BuildingId = w.BuildingId,
                    BuildingName = w.Building != null ? w.Building.Name : null,
                    Name = w.Name,
                    FloorLevel = w.FloorLevel,
                    Description = w.Description,
                    BinCount = w.Bins.Count
                })
                .ToListAsync();

            return ServiceResponse<List<ResponseWasteZoneDto>>.Success(zones);
        }
    }
}
