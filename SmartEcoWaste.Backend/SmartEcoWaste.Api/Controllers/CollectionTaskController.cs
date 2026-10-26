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
    [Authorize] // Minimum: all callers must be authenticated
    public class CollectionTaskController : ControllerBase
    {
        private readonly ICollectionTaskService _taskService;
        private readonly IAuditLogService _auditLogService;

        public CollectionTaskController(ICollectionTaskService taskService, IAuditLogService auditLogService)
        {
            _taskService = taskService;
            _auditLogService = auditLogService;
        }

        /// <summary>Returns the authenticated caller's user ID from the JWT token.</summary>
        private int GetCurrentUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(idClaim, out var id) ? id : 0;
        }

        private int GetCurrentTenantId()
        {
            var tenantClaim = User.FindFirst("TenantId")?.Value;
            return int.TryParse(tenantClaim, out var id) ? id : 0;
        }

        private string? GetCurrentUserEmail()
        {
            return User.FindFirst(ClaimTypes.Email)?.Value;
        }

        /// <summary>True when the caller holds an Admin or Supervisor role.</summary>
        private bool IsPrivileged() =>
            User.IsInRole("Admin") || User.IsInRole("Supervisor");

        /// <summary>
        /// Creates a new collection task.
        /// Only Admins and Supervisors may schedule work assignments.
        /// </summary>
        [Authorize(Roles = "Admin,Supervisor")]
        [HttpPost("create-task")]
        public async Task<IActionResult> CreateTask([FromBody] CreateCollectionTaskDto dto)
        {
            var res = await _taskService.CreateTaskAsync(dto);
            if (res.IsSuccess && res.Data != null)
            {
                await _auditLogService.LogAsync(
                    GetCurrentTenantId(),
                    GetCurrentUserId(),
                    GetCurrentUserEmail(),
                    "CreateTask",
                    "CollectionTask",
                    res.Data.Id,
                    $"Task created: '{res.Data.Title}', assigned to user {dto.AssignedUserId}"
                );
                return Ok(res);
            }
            return BadRequest(res);
        }

        /// <summary>
        /// Updates an existing collection task (re-assign, change due date, instructions, etc.).
        /// Only Admins and Supervisors may re-assign or edit tasks.
        /// </summary>
        [Authorize(Roles = "Admin,Supervisor")]
        [HttpPut("update-task/{taskId}")]
        public async Task<IActionResult> UpdateTask(int taskId, [FromBody] UpdateCollectionTaskDto dto)
        {
            var res = await _taskService.UpdateTaskAsync(taskId, dto);
            if (res.IsSuccess && res.Data != null)
            {
                await _auditLogService.LogAsync(
                    GetCurrentTenantId(),
                    GetCurrentUserId(),
                    GetCurrentUserEmail(),
                    "UpdateTask",
                    "CollectionTask",
                    taskId,
                    $"Task {taskId} updated/reassigned to User {dto.AssignedUserId}"
                );
                return Ok(res);
            }
            return BadRequest(res);
        }

        /// <summary>
        /// Retrieves all collection tasks within the caller's tenant.
        /// Restricted to operational management: Admins and Supervisors.
        /// </summary>
        [Authorize(Roles = "Admin,Supervisor")]
        [HttpGet("get-all-tasks")]
        public async Task<IActionResult> GetAllTasks()
        {
            var res = await _taskService.GetAllTasksAsync();
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }

        /// <summary>
        /// Retrieves only the tasks assigned to the currently authenticated user.
        /// Available to Contractors, Supervisors, Admins, and Staff.
        /// </summary>
        [Authorize(Roles = "Admin,Supervisor,Contractor,Staff")]
        [HttpGet("get-my-tasks")]
        public async Task<IActionResult> GetMyTasks()
        {
            var userId = GetCurrentUserId();
            var res = await _taskService.GetMyAssignedTasksAsync(userId);
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }

        /// <summary>
        /// Updates the status of a collection task.
        /// Contractors and Staff may only update tasks assigned to themselves.
        /// Admins and Supervisors may update any task within the tenant.
        /// </summary>
        [Authorize(Roles = "Admin,Supervisor,Contractor,Staff")]
        [HttpPut("update-status/{taskId}")]
        public async Task<IActionResult> UpdateStatus(int taskId, [FromQuery] CollectionTaskStatus status)
        {
            var callerUserId = GetCurrentUserId();
            var isPrivileged = IsPrivileged();
            var res = await _taskService.UpdateTaskStatusAsync(callerUserId, isPrivileged, taskId, status);
            if (res.IsSuccess)
            {
                await _auditLogService.LogAsync(
                    GetCurrentTenantId(),
                    callerUserId,
                    GetCurrentUserEmail(),
                    "UpdateTaskStatus",
                    "CollectionTask",
                    taskId,
                    $"Task {taskId} status changed to {status}"
                );
                return Ok(res);
            }
            return BadRequest(res);
        }

        /// <summary>
        /// Submits a field inspection log for a bin.
        /// Contractors, Staff, and Supervisors may submit on-site inspection results.
        /// The inspector identity is securely derived from the JWT token.
        /// </summary>
        [Authorize(Roles = "Admin,Supervisor,Contractor,Staff")]
        [HttpPost("submit-inspection")]
        public async Task<IActionResult> SubmitInspection([FromBody] SubmitInspectionDto dto)
        {
            var userId = GetCurrentUserId();
            var res = await _taskService.SubmitInspectionAsync(userId, dto);
            if (res.IsSuccess && res.Data != null)
            {
                await _auditLogService.LogAsync(
                    GetCurrentTenantId(),
                    userId,
                    GetCurrentUserEmail(),
                    "SubmitInspection",
                    "BinInspectionLog",
                    res.Data.Id,
                    $"Inspection logged for Bin {dto.BinId}, Condition: {dto.Condition}, Fill: {dto.FillLevelPercentage}%"
                );
                return Ok(res);
            }
            return BadRequest(res);
        }

        /// <summary>
        /// Retrieves all field inspection logs, optionally filtered by bin.
        /// Restricted to operational staff: Admins and Supervisors.
        /// </summary>
        [Authorize(Roles = "Admin,Supervisor")]
        [HttpGet("get-inspections")]
        public async Task<IActionResult> GetInspections([FromQuery] int? binId)
        {
            var res = await _taskService.GetInspectionLogsAsync(binId);
            return res.IsSuccess ? Ok(res) : BadRequest(res);
        }

        /// <summary>
        /// Approves an anomaly flagged during a field inspection.
        /// This is a supervisory / management action — restricted to Admins and Supervisors only.
        /// The approver identity is securely derived from the JWT token.
        /// </summary>
        [Authorize(Roles = "Admin,Supervisor")]
        [HttpPost("approve-anomaly")]
        public async Task<IActionResult> ApproveAnomaly([FromBody] ApproveInspectionAnomalyDto dto)
        {
            var userId = GetCurrentUserId();
            var res = await _taskService.ApproveAnomalyAsync(userId, dto);
            if (res.IsSuccess)
            {
                await _auditLogService.LogAsync(
                    GetCurrentTenantId(),
                    userId,
                    GetCurrentUserEmail(),
                    "ApproveAnomaly",
                    "BinInspectionLog",
                    dto.InspectionLogId,
                    $"Anomaly approved by Supervisor {userId}. Notes: {dto.ResolutionNotes}"
                );
                return Ok(res);
            }
            return BadRequest(res);
        }
    }
}
