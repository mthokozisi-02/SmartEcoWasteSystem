using SmartEcoWaste.Data.Enums;
using System;
using System.Collections.Generic;

namespace SmartEcoWaste.Data.Dtos
{
    public class CreatePropertyDto
    {
        public string Name { get; set; } = null!;
        public string Code { get; set; } = null!;
        public PropertyType Type { get; set; } = PropertyType.CommercialMall;
        public string? Address { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }

    public class ResponsePropertyDto
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public string Name { get; set; } = null!;
        public string Code { get; set; } = null!;
        public PropertyType Type { get; set; }
        public string? Address { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public int BuildingCount { get; set; }
        public int WasteZoneCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateBuildingDto
    {
        public int PropertyId { get; set; }
        public string Name { get; set; } = null!;
        public string? Code { get; set; }
        public int NumberOfFloors { get; set; } = 1;
    }

    public class ResponseBuildingDto
    {
        public int Id { get; set; }
        public int PropertyId { get; set; }
        public string PropertyName { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Code { get; set; }
        public int NumberOfFloors { get; set; }
    }

    public class CreateWasteZoneDto
    {
        public int PropertyId { get; set; }
        public int? BuildingId { get; set; }
        public string Name { get; set; } = null!;
        public string? FloorLevel { get; set; }
        public string? Description { get; set; }
    }

    public class ResponseWasteZoneDto
    {
        public int Id { get; set; }
        public int PropertyId { get; set; }
        public string PropertyName { get; set; } = null!;
        public int? BuildingId { get; set; }
        public string? BuildingName { get; set; }
        public string Name { get; set; } = null!;
        public string? FloorLevel { get; set; }
        public string? Description { get; set; }
        public int BinCount { get; set; }
    }
}
