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
        Task<ServiceResponse<ResponseCollectionTaskDto>> UpdateTaskStatusAsync(int taskId, Data.Enums.CollectionTaskStatus status);

        Task<ServiceResponse<ResponseInspectionLogDto>> SubmitInspectionAsync(int inspectorUserId, SubmitInspectionDto dto);
        Task<ServiceResponse<List<ResponseInspectionLogDto>>> GetInspectionLogsAsync(int? binId = null);
        Task<ServiceResponse<bool>> ApproveAnomalyAsync(int supervisorUserId, ApproveInspectionAnomalyDto dto);
    }
}
