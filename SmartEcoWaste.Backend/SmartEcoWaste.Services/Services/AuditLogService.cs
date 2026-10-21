using Microsoft.EntityFrameworkCore;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Data.Entities;
using SmartEcoWaste.Infrastructure.DbContexts;
using SmartEcoWaste.Services.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SmartEcoWaste.Services.Services
{
    public class AuditLogService : IAuditLogService
    {
        private readonly SmartEcoWasteDbContext _context;

        public AuditLogService(SmartEcoWasteDbContext context)
        {
            _context = context;
        }

        public async Task LogAsync(int tenantId, int? userId, string? userEmail, string action, string entityType, int? entityId, string? details, string? ipAddress = null)
        {
            try
            {
                var log = new AuditLog
                {
                    TenantId = tenantId,
                    UserId = userId,
                    UserEmail = userEmail,
                    Action = action,
                    EntityType = entityType,
                    EntityId = entityId,
                    Details = details,
                    IpAddress = ipAddress
                };

                _context.AuditLogs.Add(log);
                await _context.SaveChangesAsync();
            }
            catch
            {
                // Never let audit logging failure crash the primary business operation
            }
        }

        public async Task<ServiceResponse<PagedResultDto<AuditLog>>> GetAuditLogsAsync(PaginationFilterDto filter)
        {
            var query = _context.AuditLogs.AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var term = filter.SearchTerm.Trim().ToLower();
                query = query.Where(a =>
                    a.Action.ToLower().Contains(term) ||
                    a.EntityType.ToLower().Contains(term) ||
                    (a.UserEmail != null && a.UserEmail.ToLower().Contains(term)) ||
                    (a.Details != null && a.Details.ToLower().Contains(term)));
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(a => a.CreatedAt)
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var paged = new PagedResultDto<AuditLog>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = filter.PageNumber,
                PageSize = filter.PageSize
            };

            return ServiceResponse<PagedResultDto<AuditLog>>.Success(paged);
        }
    }
}
