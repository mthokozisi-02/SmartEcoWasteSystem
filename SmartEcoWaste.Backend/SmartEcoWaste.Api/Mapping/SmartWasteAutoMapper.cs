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

            CreateMap<Bin, BinResponseDto>();
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
