using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Data.Entities;
using SmartEcoWaste.Services.Services;
using System.Threading.Tasks;

namespace SmartEcoWaste.Services.Interfaces
{
    public interface IAuditLogService
    {
        Task LogAsync(int tenantId, int? userId, string? userEmail, string action, string entityType, int? entityId, string? details, string? ipAddress = null);
        Task<ServiceResponse<PagedResultDto<AuditLog>>> GetAuditLogsAsync(PaginationFilterDto filter);
    }
}
