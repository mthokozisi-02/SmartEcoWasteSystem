using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Data.Entities;
using SmartEcoWaste.Infrastructure.DbContexts;
using SmartEcoWaste.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace SmartEcoWaste.Services.Services
{
    public class UserService(IMapper mapper, SmartEcoWasteDbContext smartEcoWasteDb, IConfiguration configuration) : IUserService
    {
        private readonly IConfiguration _configuration = configuration;
        private readonly IMapper _mapper = mapper;
        private readonly SmartEcoWasteDbContext _smartEcoWasteDb = smartEcoWasteDb;

        public async Task<ServiceResponse<string>> CreateAsyc(UserDto userDto)
        {
            userDto.PasswordHash = new PasswordHasher<User>()
                .HashPassword(new User(), userDto.PasswordHash);
            var newUser = _mapper.Map<User>(userDto);
            _smartEcoWasteDb.Users.Add(newUser);
            await _smartEcoWasteDb.SaveChangesAsync();


            var response = ServiceResponse<string>.Success(
                "User created successfully",
                "User created successfully"
            );

            return response;
        }

        private async Task<User?> ValidateRefreshTokenAsync(int userId, string refreshToken)
        {
            var user = await _smartEcoWasteDb.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null || user.RefreshToken != refreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                return null;
            }
            return user;
        }

        public async Task<ServiceResponse<TokenResponseDto>> RefreshTokensAsync(RefreshTokenRequestDto request)
        {
            var user = await ValidateRefreshTokenAsync(request.UserId, request.RefreshToken);
            if (user == null)
            {
                return ServiceResponse<TokenResponseDto>.Fail("Invalid refresh token or user ID.");
            }

            return await CreateTokenResponse(user);
        }

        public async Task<ServiceResponse<TokenResponseDto>> LoginAsync(LoginDto userDto)
        {

            var user = await _smartEcoWasteDb.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == userDto.Email);

            if (new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, userDto.PasswordHash)
                == PasswordVerificationResult.Success)
            {
                var response = await CreateTokenResponse(user);

                return response;
            }
            else
            {
                return ServiceResponse<TokenResponseDto>.Fail("Invalid email or password.");
            }
        }

        private async Task<ServiceResponse<TokenResponseDto>> CreateTokenResponse(User user)
        {
            var response = new TokenResponseDto
            {
                AccessToken = CreateToken(user),
                RefreshToken = await GenerateAndSaveRefreshTokenAsync(user)
            };

            return ServiceResponse<TokenResponseDto>.Success(
                response,
                "Tokens generated successfully"
            );
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
                return Convert.ToBase64String(randomNumber);
            }
        }

        private async Task<string> GenerateAndSaveRefreshTokenAsync(User user)
        {
            var refreshToken = GenerateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await _smartEcoWasteDb.SaveChangesAsync();
            return refreshToken;
        }

        private string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.Name, user.Email),
                new(ClaimTypes.NameIdentifier, user.Id.ToString()!),
                new(ClaimTypes.Role, user.Role.Name)

            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["AppSettings:Token"]!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

            var tokenDecriptor = new JwtSecurityToken(
                issuer: _configuration["AppSettings:Issuer"],
                audience: _configuration["AppSettings:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(tokenDecriptor);


        }

        public async Task<ServiceResponse<List<ResponseUserDto>>> GetAllAsync()
        {
            var users = await _smartEcoWasteDb.Users.ToListAsync();

            return ServiceResponse<List<ResponseUserDto>>.Success(
                _mapper.Map<List<ResponseUserDto>>(users),
                "Users retrieved successfully"
            );
        }

        public async Task<ServiceResponse<string>> AssignRolesAsync(AssignUserRolesDto userRole)
        {
            var user = await _smartEcoWasteDb.Users
                .FirstOrDefaultAsync(u => u.Id == userRole.UserId);

            if (user == null)
            {
                return ServiceResponse<string>.Fail("User not found");
            }

            user.RoleId = userRole.RoleId;

            await _smartEcoWasteDb.SaveChangesAsync();

            return ServiceResponse<string>.Success(
                "Role assigned successfully",
                "User role updated"
            );
        }
    }
}
