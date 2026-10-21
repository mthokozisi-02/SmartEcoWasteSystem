using Microsoft.EntityFrameworkCore;
using SmartEcoWaste.Data.Dtos;
using SmartEcoWaste.Data.Entities;
using SmartEcoWaste.Data.Enums;
using SmartEcoWaste.Infrastructure.DbContexts;
using SmartEcoWaste.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SmartEcoWaste.Services.Services
{
    public class CollectionTaskService : ICollectionTaskService
    {
        private readonly SmartEcoWasteDbContext _context;

        public CollectionTaskService(SmartEcoWasteDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResponse<ResponseCollectionTaskDto>> CreateTaskAsync(CreateCollectionTaskDto dto)
        {
            // 1. Cross-tenant check: Target bin must belong to the current tenant
            var bin = await _context.Bins
                .Include(b => b.WasteZone)
                .ThenInclude(w => w!.Property)
                .FirstOrDefaultAsync(b => b.Id == dto.BinId && !b.IsDeleted);

            if (bin == null)
            {
                return ServiceResponse<ResponseCollectionTaskDto>.Fail("Target bin does not exist or does not belong to your organization.");
            }

            // 2. Cross-tenant check: Assigned user must belong to the SAME tenant as the bin
            string? assignedUserName = null;
            if (dto.AssignedUserId.HasValue)
            {
                var assignedUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == dto.AssignedUserId.Value && !u.IsDeleted);

                if (assignedUser == null)
                {
                    return ServiceResponse<ResponseCollectionTaskDto>.Fail("Assigned staff member does not exist or does not belong to your organization.");
                }

                if (assignedUser.TenantId != bin.TenantId)
                {
                    return ServiceResponse<ResponseCollectionTaskDto>.Fail("Cannot assign tasks to a user from another organization.");
                }

                assignedUserName = assignedUser.Name;
            }

            var task = new CollectionTask
            {
                TenantId = bin.TenantId,
                BinId = dto.BinId,
                AssignedUserId = dto.AssignedUserId,
                ContractorName = dto.ContractorName,
                Title = dto.Title,
                Instructions = dto.Instructions,
                Status = CollectionTaskStatus.Pending,
                ScheduledAt = dto.ScheduledAt,
                DueDate = dto.DueDate
            };

            _context.CollectionTasks.Add(task);
            await _context.SaveChangesAsync();

            var response = new ResponseCollectionTaskDto
            {
                Id = task.Id,
                BinId = bin.Id,
                BinTag = bin.BinTag,
                ZoneName = bin.WasteZone?.Name,
                PropertyName = bin.WasteZone?.Property?.Name,
                AssignedUserId = task.AssignedUserId,
                AssignedUserName = assignedUserName,
                ContractorName = task.ContractorName,
                Title = task.Title,
                Instructions = task.Instructions,
                Status = task.Status,
                ScheduledAt = task.ScheduledAt,
                DueDate = task.DueDate
            };

            return ServiceResponse<ResponseCollectionTaskDto>.Success(response, "Collection task created successfully");
        }

        public async Task<ServiceResponse<List<ResponseCollectionTaskDto>>> GetAllTasksAsync()
        {
            var tasks = await _context.CollectionTasks
                .Include(t => t.Bin)
                .ThenInclude(b => b.WasteZone)
                .ThenInclude(w => w!.Property)
                .Include(t => t.AssignedUser)
                .OrderByDescending(t => t.ScheduledAt)
                .Select(t => new ResponseCollectionTaskDto
                {
                    Id = t.Id,
                    BinId = t.BinId,
                    BinTag = t.Bin != null ? t.Bin.BinTag : string.Empty,
                    ZoneName = t.Bin != null && t.Bin.WasteZone != null ? t.Bin.WasteZone.Name : null,
                    PropertyName = t.Bin != null && t.Bin.WasteZone != null && t.Bin.WasteZone.Property != null ? t.Bin.WasteZone.Property.Name : null,
                    AssignedUserId = t.AssignedUserId,
                    AssignedUserName = t.AssignedUser != null ? t.AssignedUser.Name : null,
                    ContractorName = t.ContractorName,
                    Title = t.Title,
                    Instructions = t.Instructions,
                    Status = t.Status,
                    ScheduledAt = t.ScheduledAt,
                    StartedAt = t.StartedAt,
                    CompletedAt = t.CompletedAt,
                    DueDate = t.DueDate
                })
                .ToListAsync();

            return ServiceResponse<List<ResponseCollectionTaskDto>>.Success(tasks);
        }

        public async Task<ServiceResponse<List<ResponseCollectionTaskDto>>> GetMyAssignedTasksAsync(int userId)
        {
            var tasks = await _context.CollectionTasks
                .Include(t => t.Bin)
                .ThenInclude(b => b.WasteZone)
                .ThenInclude(w => w!.Property)
                .Include(t => t.AssignedUser)
                .Where(t => t.AssignedUserId == userId)
                .OrderBy(t => t.DueDate)
                .Select(t => new ResponseCollectionTaskDto
                {
                    Id = t.Id,
                    BinId = t.BinId,
                    BinTag = t.Bin != null ? t.Bin.BinTag : string.Empty,
                    ZoneName = t.Bin != null && t.Bin.WasteZone != null ? t.Bin.WasteZone.Name : null,
                    PropertyName = t.Bin != null && t.Bin.WasteZone != null && t.Bin.WasteZone.Property != null ? t.Bin.WasteZone.Property.Name : null,
                    AssignedUserId = t.AssignedUserId,
                    AssignedUserName = t.AssignedUser != null ? t.AssignedUser.Name : null,
                    ContractorName = t.ContractorName,
                    Title = t.Title,
                    Instructions = t.Instructions,
                    Status = t.Status,
                    ScheduledAt = t.ScheduledAt,
                    StartedAt = t.StartedAt,
                    CompletedAt = t.CompletedAt,
                    DueDate = t.DueDate
                })
                .ToListAsync();

            return ServiceResponse<List<ResponseCollectionTaskDto>>.Success(tasks);
        }

        public async Task<ServiceResponse<ResponseCollectionTaskDto>> UpdateTaskStatusAsync(int callerUserId, bool isPrivileged, int taskId, CollectionTaskStatus status)
        {
            // Define allowed state transitions
            var allowedTransitions = new Dictionary<CollectionTaskStatus, CollectionTaskStatus[]>
            {
                { CollectionTaskStatus.Pending, new[] { CollectionTaskStatus.InProgress, CollectionTaskStatus.Cancelled } },
                { CollectionTaskStatus.InProgress, new[] { CollectionTaskStatus.Completed, CollectionTaskStatus.RequiresApproval, CollectionTaskStatus.Cancelled } },
                { CollectionTaskStatus.RequiresApproval, new[] { CollectionTaskStatus.Completed, CollectionTaskStatus.InProgress } },
                { CollectionTaskStatus.Completed, new CollectionTaskStatus[0] }, // terminal, can be reopened only by privileged
                { CollectionTaskStatus.Cancelled, new CollectionTaskStatus[0] }, // terminal, can be reopened only by privileged
                { CollectionTaskStatus.Overdue, new[] { CollectionTaskStatus.InProgress, CollectionTaskStatus.Cancelled } }
            };

            var task = await _context.CollectionTasks
                .Include(t => t.Bin)
                .Include(t => t.AssignedUser)
                .FirstOrDefaultAsync(t => t.Id == taskId);

            if (task == null)
            {
                return ServiceResponse<ResponseCollectionTaskDto>.Fail("Task not found in your organization");
            }

            // Ownership check
            if (!isPrivileged && task.AssignedUserId != callerUserId)
            {
                return ServiceResponse<ResponseCollectionTaskDto>.Fail("You are not authorized to update this task. It is not assigned to you.");
            }

            // Validate transition
            if (!allowedTransitions.TryGetValue(task.Status, out var nextAllowed) || !nextAllowed.Contains(status))
            {
                // Allow privileged users to force a transition to Reopened (treated as Pending)
                if (isPrivileged && (status == CollectionTaskStatus.Pending))
                {
                    // permitted reopening
                }
                else
                {
                    return ServiceResponse<ResponseCollectionTaskDto>.Fail($"Invalid status transition from {task.Status} to {status}.");
                }
            }

            // Contractors cannot set terminal or administrative statuses without privilege
            if (!isPrivileged && (status == CollectionTaskStatus.RequiresApproval || status == CollectionTaskStatus.Cancelled))
            {
                return ServiceResponse<ResponseCollectionTaskDto>.Fail("You do not have permission to set this task status.");
            }

            task.Status = status;
            if (status == CollectionTaskStatus.InProgress && !task.StartedAt.HasValue)
            {
                task.StartedAt = DateTime.UtcNow;
            }
            else if (status == CollectionTaskStatus.Completed)
            {
                task.CompletedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            var response = new ResponseCollectionTaskDto
            {
                Id = task.Id,
                BinId = task.BinId,
                BinTag = task.Bin?.BinTag ?? string.Empty,
                AssignedUserId = task.AssignedUserId,
                AssignedUserName = task.AssignedUser?.Name,
                ContractorName = task.ContractorName,
                Title = task.Title,
                Instructions = task.Instructions,
                Status = task.Status,
                ScheduledAt = task.ScheduledAt,
                StartedAt = task.StartedAt,
                CompletedAt = task.CompletedAt,
                DueDate = task.DueDate
            };

            return ServiceResponse<ResponseCollectionTaskDto>.Success(response, "Task status updated");
        }
        

        public async Task<ServiceResponse<ResponseInspectionLogDto>> SubmitInspectionAsync(int inspectorUserId, SubmitInspectionDto dto)
        {
            // 1. Validate bin belongs to inspector's tenant
            var bin = await _context.Bins.FirstOrDefaultAsync(b => b.Id == dto.BinId && !b.IsDeleted);
            if (bin == null)
            {
                return ServiceResponse<ResponseInspectionLogDto>.Fail("Target bin does not exist or does not belong to your organization.");
            }

            // 2. Validate inspector belongs to same tenant
            var inspector = await _context.Users.FirstOrDefaultAsync(u => u.Id == inspectorUserId && !u.IsDeleted);
            if (inspector == null || inspector.TenantId != bin.TenantId)
            {
                return ServiceResponse<ResponseInspectionLogDto>.Fail("Inspector user not found in your organization.");
            }

            // 3. If linking to a collection task, verify tenant and bin match
            if (dto.CollectionTaskId.HasValue)
            {
                var task = await _context.CollectionTasks.FirstOrDefaultAsync(t => t.Id == dto.CollectionTaskId.Value);
                if (task == null)
                {
                    return ServiceResponse<ResponseInspectionLogDto>.Fail("Referenced collection task does not belong to your organization.");
                }
                if (task.BinId != dto.BinId)
                {
                    return ServiceResponse<ResponseInspectionLogDto>.Fail("Collection task bin does not match the inspected bin.");
                }
                if (task.TenantId != bin.TenantId)
                {
                    return ServiceResponse<ResponseInspectionLogDto>.Fail("Collection task does not belong to your organization.");
                }
            }

            // 4. Validate measurement values
            if (dto.FillLevelPercentage < 0 || dto.FillLevelPercentage > 100)
            {
                return ServiceResponse<ResponseInspectionLogDto>.Fail("Fill level percentage must be between 0 and 100.");
            }
            if (dto.MeasuredWeightKg < 0)
            {
                return ServiceResponse<ResponseInspectionLogDto>.Fail("Measured weight cannot be negative.");
            }
            if (!string.IsNullOrWhiteSpace(dto.Notes) && dto.Notes.Length > 500)
            {
                return ServiceResponse<ResponseInspectionLogDto>.Fail("Notes exceed maximum length of 500 characters.");
            }
            if (!string.IsNullOrWhiteSpace(dto.PhotoProofUrl) && dto.PhotoProofUrl.Length > 300)
            {
                return ServiceResponse<ResponseInspectionLogDto>.Fail("Photo URL exceeds maximum length of 300 characters.");
            }

            // 5. Prevent duplicate inspection for same bin/task/inspector on same day
            if (dto.CollectionTaskId.HasValue)
            {
                var today = DateTime.UtcNow.Date;
                var exists = await _context.BinInspectionLogs.AnyAsync(l =>
                    l.BinId == dto.BinId &&
                    l.CollectionTaskId == dto.CollectionTaskId &&
                    l.InspectorUserId == inspectorUserId &&
                    l.CreatedAt >= today &&
                    l.CreatedAt < today.AddDays(1));
                if (exists)
                {
                    return ServiceResponse<ResponseInspectionLogDto>.Fail("An inspection for this task and bin has already been submitted today.");
                }
            }

            // 6. Create inspection log (ignore client-provided QrCodeScanned; treat as server-validated)
            var log = new BinInspectionLog
            {
                TenantId = bin.TenantId,
                BinId = dto.BinId,
                CollectionTaskId = dto.CollectionTaskId,
                InspectorUserId = inspectorUserId,
                QrCodeScanned = true, // server assumes QR was verified as part of the request
                FillLevelPercentage = dto.FillLevelPercentage,
                MeasuredWeightKg = dto.MeasuredWeightKg,
                Condition = dto.Condition,
                PhotoProofUrl = dto.PhotoProofUrl,
                Notes = dto.Notes,
                HasAnomaly = dto.HasAnomaly || dto.Condition != InspectionCondition.NormalClean,
                AnomalyReason = dto.AnomalyReason,
                IsApproved = !(dto.HasAnomaly || dto.Condition != InspectionCondition.NormalClean)
            };

            _context.BinInspectionLogs.Add(log);

            // 7. Update bin status with refined rules
            if (log.Condition == InspectionCondition.DamagedLidOrPedal || log.Condition == InspectionCondition.VandalizedOrGraffiti)
            {
                bin.Status = Status.Damaged;
            }
            else if (log.Condition == InspectionCondition.Overflowing || log.FillLevelPercentage >= 90)
            {
                bin.Status = Status.Overflowing;
            }
            else if (log.Condition == InspectionCondition.NormalClean && log.FillLevelPercentage >= 90)
            {
                bin.Status = Status.Full;
            }
            else if (log.Condition == InspectionCondition.NormalClean && log.FillLevelPercentage < 70)
            {
                bin.Status = Status.Emptied;
            }
            else
            {
                // For any other condition with moderate fill, keep current status
            }

            // 8. If linked to a task, update its status but do not set CompletedAt here
            if (dto.CollectionTaskId.HasValue)
            {
                var task = await _context.CollectionTasks.FindAsync(dto.CollectionTaskId.Value);
                if (task != null)
                {
                    task.Status = log.HasAnomaly ? CollectionTaskStatus.RequiresApproval : CollectionTaskStatus.Completed;
                    // Do not set CompletedAt; let task completion flow handle it
                }
            }

            await _context.SaveChangesAsync();

            var response = new ResponseInspectionLogDto
            {
                Id = log.Id,
                BinId = bin.Id,
                BinTag = bin.BinTag,
                CollectionTaskId = log.CollectionTaskId,
                InspectorUserId = inspector.Id,
                InspectorUserName = inspector.Name,
                QrCodeScanned = log.QrCodeScanned,
                FillLevelPercentage = log.FillLevelPercentage,
                MeasuredWeightKg = log.MeasuredWeightKg,
                Condition = log.Condition,
                PhotoProofUrl = log.PhotoProofUrl,
                Notes = log.Notes,
                HasAnomaly = log.HasAnomaly,
                AnomalyReason = log.AnomalyReason,
                IsApproved = log.IsApproved,
                CreatedAt = log.CreatedAt
            };

            return ServiceResponse<ResponseInspectionLogDto>.Success(response, "Inspection submitted successfully");
        }

        public async Task<ServiceResponse<List<ResponseInspectionLogDto>>> GetInspectionLogsAsync(int? binId = null)
        {
            var query = _context.BinInspectionLogs
                .Include(l => l.Bin)
                .Include(l => l.InspectorUser)
                .Include(l => l.ApprovedByUser)
                .AsQueryable();

            if (binId.HasValue)
            {
                query = query.Where(l => l.BinId == binId.Value);
            }

            var logs = await query
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => new ResponseInspectionLogDto
                {
                    Id = l.Id,
                    BinId = l.BinId,
                    BinTag = l.Bin != null ? l.Bin.BinTag : string.Empty,
                    CollectionTaskId = l.CollectionTaskId,
                    InspectorUserId = l.InspectorUserId,
                    InspectorUserName = l.InspectorUser != null ? l.InspectorUser.Name : string.Empty,
                    QrCodeScanned = l.QrCodeScanned,
                    FillLevelPercentage = l.FillLevelPercentage,
                    MeasuredWeightKg = l.MeasuredWeightKg,
                    Condition = l.Condition,
                    PhotoProofUrl = l.PhotoProofUrl,
                    Notes = l.Notes,
                    HasAnomaly = l.HasAnomaly,
                    AnomalyReason = l.AnomalyReason,
                    IsApproved = l.IsApproved,
                    ApprovedByUserName = l.ApprovedByUser != null ? l.ApprovedByUser.Name : null,
                    ApprovedAt = l.ApprovedAt,
                    CreatedAt = l.CreatedAt
                })
                .ToListAsync();

            return ServiceResponse<List<ResponseInspectionLogDto>>.Success(logs);
        }

        public async Task<ServiceResponse<bool>> ApproveAnomalyAsync(int supervisorUserId, ApproveInspectionAnomalyDto dto)
        {
            // 1. Cross-tenant check: Inspection log must belong to current tenant
            var log = await _context.BinInspectionLogs
                .Include(l => l.CollectionTask)
                .FirstOrDefaultAsync(l => l.Id == dto.InspectionLogId);

            if (log == null)
            {
                return ServiceResponse<bool>.Fail("Inspection log not found in your organization");
            }

            // 2. Cross-tenant check: Supervisor must belong to current tenant and have Supervisor role
            var supervisor = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == supervisorUserId && !u.IsDeleted);

            if (supervisor == null || supervisor.TenantId != log.TenantId)
            {
                return ServiceResponse<bool>.Fail("Supervisor not found in your organization");
            }

            if (!string.Equals(supervisor.Role?.Name, "Supervisor", StringComparison.OrdinalIgnoreCase))
            {
                return ServiceResponse<bool>.Fail("User does not have Supervisor privileges to approve anomalies");
            }

            log.IsApproved = true;
            log.ApprovedByUserId = supervisorUserId;
            log.ApprovedAt = DateTime.UtcNow;
            if (!string.IsNullOrWhiteSpace(dto.ResolutionNotes))
            {
                log.Notes = $"{log.Notes} | Supervisor Resolution: {dto.ResolutionNotes}".TrimStart(' ', '|');
            }

            // Update task status only if it is awaiting approval
            if (log.CollectionTask != null && log.CollectionTask.Status == CollectionTaskStatus.RequiresApproval)
            {
                log.CollectionTask.Status = CollectionTaskStatus.Completed;
                // Do not set CompletedAt here; let the normal flow handle it
            }

            await _context.SaveChangesAsync();
            return ServiceResponse<bool>.Success(true, "Anomaly approved and resolved by supervisor");
        }

    }
}
