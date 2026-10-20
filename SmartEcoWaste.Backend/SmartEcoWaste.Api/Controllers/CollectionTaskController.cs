using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Data.Enums;
using SmartEcoWaste.Services.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SmartEcoWaste.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CollectionTaskController : ControllerBase
    {
        private readonly ICollectionTaskService _taskService;

        public CollectionTaskController(ICollectionTaskService taskService)
        {
            _taskService = taskService;
        }

        private int GetCurrentUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(idClaim, out var id) ? id : 0;
        }

        [HttpPost("create-task")]
        public async Task<IActionResult> CreateTask([FromBody] CreateCollectionTaskDto dto)
        {
            var res = await _taskService.CreateTaskAsync(dto);
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }

        [HttpGet("get-all-tasks")]
        public async Task<IActionResult> GetAllTasks()
        {
            var res = await _taskService.GetAllTasksAsync();
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }

        [HttpGet("get-my-tasks")]
        public async Task<IActionResult> GetMyTasks()
        {
            var userId = GetCurrentUserId();
            var res = await _taskService.GetMyAssignedTasksAsync(userId);
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }

        [HttpPut("update-status/{taskId}")]
        public async Task<IActionResult> UpdateStatus(int taskId, [FromQuery] CollectionTaskStatus status)
        {
            var res = await _taskService.UpdateTaskStatusAsync(taskId, status);
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }

        [HttpPost("submit-inspection")]
        public async Task<IActionResult> SubmitInspection([FromBody] SubmitInspectionDto dto)
        {
            var userId = GetCurrentUserId();
            var res = await _taskService.SubmitInspectionAsync(userId, dto);
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }

        [HttpGet("get-inspections")]
        public async Task<IActionResult> GetInspections([FromQuery] int? binId)
        {
            var res = await _taskService.GetInspectionLogsAsync(binId);
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }

        [HttpPost("approve-anomaly")]
        public async Task<IActionResult> ApproveAnomaly([FromBody] ApproveInspectionAnomalyDto dto)
        {
            var userId = GetCurrentUserId();
            var res = await _taskService.ApproveAnomalyAsync(userId, dto);
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }
    }
}
