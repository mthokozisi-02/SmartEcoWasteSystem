using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Services.Interfaces;
using SmartEcoWaste.Services.Services;

namespace SmartEcoWaste.Api.Controllers
{
    public class UserController(IUserService userService) : Controller
    {

        private readonly IUserService _userService = userService;


        [HttpPost("create-user")]
        public async Task<IActionResult> CreateUSer(UserDto user)
        {
            return Ok(await _userService.CreateAsyc(user));
        }

        [HttpPost("user-login")]
        public async Task<IActionResult> Login(LoginDto user)
        {
            return Ok(await _userService.LoginAsync(user));
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("bins")]
        public IActionResult CreateBin()
        {
            return Ok();
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("get-all-users")]
        public async Task<IActionResult> GetAllUsers()
        {
            return Ok(await _userService.GetAllAsync());
        }
    }
}
