using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Services.Interfaces;
using SmartEcoWaste.Services.Services;

namespace SmartEcoWaste.Api.Controllers
{
    [Route("api/")]
    [ApiController]
    public class UserController(IUserService userService) : Controller
    {

        private readonly IUserService _userService = userService;


        [HttpPost("create-user")]
        public async Task<IActionResult> CreateUSer([FromBody] UserDto user)
        {
            return Ok(await _userService.CreateAsyc(user));
        }

        
        [HttpPost("user-login")]
        public async Task<IActionResult> Login(LoginDto user)
        {
            return Ok(await _userService.LoginAsync(user));
        }

        //[Authorize(Roles = "Admin")]
        [HttpGet("get-all-users")]
        public async Task<IActionResult> GetAllUsers()
        {
            return Ok(await _userService.GetAllAsync());
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("delete-user/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            return Ok(await _userService.DeleteUserAsync(id));
        }

        [HttpGet("get-user/{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            return Ok(await _userService.GetUser(id));
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("update-user")]
        public async Task<IActionResult> UpdateUser([FromBody] UserDto user)
        {
            return Ok(await _userService.UpdateUserAsync(user));
        }

        [HttpPost("refresh-tokens")]
        public async Task<IActionResult> RefreshToken(RefreshTokenRequestDto refreshTokenRequest)
        {
            var result = await userService.RefreshTokensAsync(refreshTokenRequest);
            if ((bool)!result.IsSuccess!)
            {
                return Unauthorized(result.Message);
            }
            return Ok(result);
        }

        [HttpPost("assign-role")]
        public async Task<IActionResult> AssignRole(AssignUserRolesDto assignUserRolesDto)
        {
            var result = await userService.AssignRolesAsync(assignUserRolesDto);
            if ((bool)!result.IsSuccess!)
            {
                return BadRequest(result.Message);
            }
            return Ok(result);
        }

        [HttpGet("get-roles")]
        public async Task<IActionResult> GetRoles()
        {
            var result = await userService.GetAllRolesAsync();
            if ((bool)!result.IsSuccess!)
            {
                return BadRequest(result.Message);
            }
            return Ok(result);
        }
    }
}
