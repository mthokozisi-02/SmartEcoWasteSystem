using AutoMapper;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Data.Entities;

namespace SmartEcoWaste.Api.Mapping
{

    public class SmartWasteAutoMapper : Profile
    {
        public SmartWasteAutoMapper()
        {

            CreateMap<User, UserDto>();
            CreateMap<UserDto, User>();

            CreateMap<User, ResponseUserDto>();
            CreateMap<ResponseUserDto, User>();

            CreateMap<User, LoginDto>();
            CreateMap<LoginDto, User>();

            CreateMap<Bin, CreateBinDto>();
            CreateMap<CreateBinDto, Bin>();

            CreateMap<Bin, BinResponseDto>()
                .ForMember(dest => dest.WasteZoneName, opt => opt.MapFrom(src => src.WasteZone != null ? src.WasteZone.Name : null))
                .ForMember(dest => dest.BuildingId, opt => opt.MapFrom(src => src.WasteZone != null ? src.WasteZone.BuildingId : null))
                .ForMember(dest => dest.BuildingName, opt => opt.MapFrom(src => src.WasteZone != null && src.WasteZone.Building != null ? src.WasteZone.Building.Name : null))
                .ForMember(dest => dest.PropertyId, opt => opt.MapFrom(src => src.WasteZone != null ? src.WasteZone.PropertyId : (int?)null))
                .ForMember(dest => dest.PropertyName, opt => opt.MapFrom(src => src.WasteZone != null && src.WasteZone.Property != null ? src.WasteZone.Property.Name : null));
            CreateMap<BinResponseDto, Bin>();

            CreateMap<Report, ReportBinDto>();
            CreateMap<ReportBinDto, Report>();

            CreateMap<User, UserResponseDto>();
            CreateMap<UserResponseDto, User>();

            CreateMap<UserPoints, UserPointsDto>();
            CreateMap<UserPointsDto, UserPoints>();

            CreateMap<Report, ReportDto>();
            CreateMap<ReportDto, Report>();
        }
    }
}
