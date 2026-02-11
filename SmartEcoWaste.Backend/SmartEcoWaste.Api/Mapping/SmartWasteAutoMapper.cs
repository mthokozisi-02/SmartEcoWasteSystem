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

            CreateMap<Report, ReportBinDto>();
            CreateMap<ReportBinDto, Report>();
        }
    }
}
