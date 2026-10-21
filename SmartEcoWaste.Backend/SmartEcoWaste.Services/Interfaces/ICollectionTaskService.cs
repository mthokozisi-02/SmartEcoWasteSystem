using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Services.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartEcoWaste.Services.Interfaces
{
    public interface ICollectionTaskService
    {
        Task<ServiceResponse<ResponseCollectionTaskDto>> CreateTaskAsync(CreateCollectionTaskDto dto);
        Task<ServiceResponse<List<ResponseCollectionTaskDto>>> GetAllTasksAsync();
        Task<ServiceResponse<List<ResponseCollectionTaskDto>>> GetMyAssignedTasksAsync(int userId);
        /// <summary>
        /// Updates the status of a collection task.
        /// Contractors may only update tasks assigned to them.
        /// Admins and Supervisors may update any task within the tenant.
        /// </summary>
        Task<ServiceResponse<ResponseCollectionTaskDto>> UpdateTaskStatusAsync(int callerUserId, bool isPrivileged, int taskId, Data.Enums.CollectionTaskStatus status);

        Task<ServiceResponse<ResponseInspectionLogDto>> SubmitInspectionAsync(int inspectorUserId, SubmitInspectionDto dto);
        Task<ServiceResponse<List<ResponseInspectionLogDto>>> GetInspectionLogsAsync(int? binId = null);
        Task<ServiceResponse<bool>> ApproveAnomalyAsync(int supervisorUserId, ApproveInspectionAnomalyDto dto);
    }
}
