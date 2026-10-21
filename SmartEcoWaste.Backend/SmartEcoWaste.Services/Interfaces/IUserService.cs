using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Data.Entities;
using SmartEcoWaste.Services.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartEcoWaste.Services.Interfaces
{
    public interface IUserService
    {
        Task<ServiceResponse<string>> CreateAsyc(UserDto userDto);
        Task<ServiceResponse<TokenResponseDto>> LoginAsync(LoginDto userDto);
        Task<ServiceResponse<TokenResponseDto>> RefreshTokensAsync(RefreshTokenRequestDto request);
        Task<ServiceResponse<List<UserResponseDto>>> GetAllAsync();
        Task<ServiceResponse<string>> AssignRolesAsync(int adminUserId, AssignUserRolesDto userRole);
        Task<ServiceResponse<string>> ChangePasswordAsync(int userId, ChangePasswordDto dto);
        Task<ServiceResponse<string>> AdminResetPasswordAsync(int adminUserId, AdminResetPasswordDto dto);
        Task<ServiceResponse<string>> UpdateUserAsync(int callerUserId, bool isAdmin, UpdatePasswordDto update);
        Task<ServiceResponse<string>> DeleteUserAsync(int adminUserId, int targetUserId);
        Task<ServiceResponse<List<Role>>> GetAllRolesAsync();
        Task<ServiceResponse<GetUserDto>> GetUser(int callerUserId, bool isAdminOrSupervisor, int targetUserId);
    }
}
