using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Data.Entities;
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
        Task<ServiceResponse<List<UserResponseDto>>> GetAllAsync();
        Task<ServiceResponse<string>> AssignRolesAsync(AssignUserRolesDto userRole);
        Task<ServiceResponse<string>> UpdateUserAsync(UserDto userDto);
        Task<ServiceResponse<string>> DeleteUserAsync(int userId);
        Task<ServiceResponse<List<Role>>> GetAllRolesAsync();
        Task<ServiceResponse<GetUserDto>> GetUser(int userId);
    }
}
