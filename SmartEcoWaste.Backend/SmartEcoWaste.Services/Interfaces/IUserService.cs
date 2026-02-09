using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Services.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartEcoWaste.Services.Interfaces
{
    public interface IUserService
    {
        Task<ServiceResponse<string>> CreateAsyc(UserDto userDto);
        Task<ServiceResponse<TokenResponseDto>> LoginAsync(LoginDto userDto);
        Task<ServiceResponse<TokenResponseDto>> RefreshTokensAsync(RefreshTokenRequestDto request);
        Task<ServiceResponse<List<ResponseUserDto>>> GetAllAsync();
        Task<ServiceResponse<string>> AssignRolesAsync(AssignUserRolesDto userRole);
    }
}
