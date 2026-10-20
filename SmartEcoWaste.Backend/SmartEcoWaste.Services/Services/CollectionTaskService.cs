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
            var bin = await _context.Bins
                .Include(b => b.WasteZone)
                .ThenInclude(w => w!.Property)
                .FirstOrDefaultAsync(b => b.Id == dto.BinId);

            if (bin == null)
            {
                return ServiceResponse<ResponseCollectionTaskDto>.Fail("Target bin not found");
            }

            var task = new CollectionTask
            {
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

            string? assignedUserName = null;
            if (task.AssignedUserId.HasValue)
            {
                var user = await _context.Users.FindAsync(task.AssignedUserId.Value);
                assignedUserName = user?.Name;
            }

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

        public async Task<ServiceResponse<ResponseCollectionTaskDto>> UpdateTaskStatusAsync(int taskId, CollectionTaskStatus status)
        {
            var task = await _context.CollectionTasks
                .Include(t => t.Bin)
                .Include(t => t.AssignedUser)
                .FirstOrDefaultAsync(t => t.Id == taskId);

            if (task == null)
            {
                return ServiceResponse<ResponseCollectionTaskDto>.Fail("Task not found");
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
            var bin = await _context.Bins.FindAsync(dto.BinId);
            if (bin == null)
            {
                return ServiceResponse<ResponseInspectionLogDto>.Fail("Target bin not found");
            }

            var inspector = await _context.Users.FindAsync(inspectorUserId);
            if (inspector == null)
            {
                return ServiceResponse<ResponseInspectionLogDto>.Fail("Inspector user not found");
            }

            var log = new BinInspectionLog
            {
                BinId = dto.BinId,
                CollectionTaskId = dto.CollectionTaskId,
                InspectorUserId = inspectorUserId,
                QrCodeScanned = dto.QrCodeScanned,
                FillLevelPercentage = Math.Clamp(dto.FillLevelPercentage, 0, 100),
                MeasuredWeightKg = dto.MeasuredWeightKg,
                Condition = dto.Condition,
                PhotoProofUrl = dto.PhotoProofUrl,
                Notes = dto.Notes,
                HasAnomaly = dto.HasAnomaly || dto.Condition != InspectionCondition.NormalClean,
                AnomalyReason = dto.AnomalyReason,
                IsApproved = !(dto.HasAnomaly || dto.Condition != InspectionCondition.NormalClean)
            };

            _context.BinInspectionLogs.Add(log);

            // Update bin status based on inspection
            if (log.Condition == InspectionCondition.Overflowing || log.FillLevelPercentage >= 90)
            {
                bin.Status = Status.Overflowing;
            }
            else if (log.Condition == InspectionCondition.DamagedLidOrPedal || log.Condition == InspectionCondition.VandalizedOrGraffiti)
            {
                bin.Status = Status.Damaged;
            }
            else if (log.FillLevelPercentage >= 70)
            {
                bin.Status = Status.Full;
            }
            else
            {
                bin.Status = Status.Emptied;
            }

            // If attached to a task, update task progress
            if (dto.CollectionTaskId.HasValue)
            {
                var task = await _context.CollectionTasks.FindAsync(dto.CollectionTaskId.Value);
                if (task != null)
                {
                    task.Status = log.HasAnomaly ? CollectionTaskStatus.RequiresApproval : CollectionTaskStatus.Completed;
                    task.CompletedAt = DateTime.UtcNow;
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
            var log = await _context.BinInspectionLogs
                .Include(l => l.CollectionTask)
                .FirstOrDefaultAsync(l => l.Id == dto.InspectionLogId);

            if (log == null)
            {
                return ServiceResponse<bool>.Fail("Inspection log not found");
            }

            var supervisor = await _context.Users.FindAsync(supervisorUserId);
            if (supervisor == null)
            {
                return ServiceResponse<bool>.Fail("Supervisor not found");
            }

            log.IsApproved = true;
            log.ApprovedByUserId = supervisorUserId;
            log.ApprovedAt = DateTime.UtcNow;
            if (!string.IsNullOrWhiteSpace(dto.ResolutionNotes))
            {
                log.Notes = $"{log.Notes} | Supervisor Resolution: {dto.ResolutionNotes}".TrimStart(' ', '|');
            }

            if (log.CollectionTask != null && log.CollectionTask.Status == CollectionTaskStatus.RequiresApproval)
            {
                log.CollectionTask.Status = CollectionTaskStatus.Completed;
            }

            await _context.SaveChangesAsync();
            return ServiceResponse<bool>.Success(true, "Anomaly approved and resolved by supervisor");
        }
    }
}
