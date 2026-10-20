using SmartEcoWaste.Data.Enums;
using System;
using System.Collections.Generic;

namespace SmartEcoWaste.Data.Dtos
{
    public class CreateCollectionTaskDto
    {
        public int BinId { get; set; }
        public int? AssignedUserId { get; set; }
        public string? ContractorName { get; set; }
        public string Title { get; set; } = null!;
        public string? Instructions { get; set; }
        public DateTime ScheduledAt { get; set; }
        public DateTime DueDate { get; set; }
    }

    public class ResponseCollectionTaskDto
    {
        public int Id { get; set; }
        public int BinId { get; set; }
        public string BinTag { get; set; } = string.Empty;
        public string? ZoneName { get; set; }
        public string? PropertyName { get; set; }
        public int? AssignedUserId { get; set; }
        public string? AssignedUserName { get; set; }
        public string? ContractorName { get; set; }
        public string Title { get; set; } = null!;
        public string? Instructions { get; set; }
        public CollectionTaskStatus Status { get; set; }
        public DateTime ScheduledAt { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime DueDate { get; set; }
    }

    public class SubmitInspectionDto
    {
        public int BinId { get; set; }
        public int? CollectionTaskId { get; set; }
        public bool QrCodeScanned { get; set; } = true;
        public int FillLevelPercentage { get; set; } // 0 - 100%
        public double? MeasuredWeightKg { get; set; }
        public InspectionCondition Condition { get; set; } = InspectionCondition.NormalClean;
        public string? PhotoProofUrl { get; set; }
        public string? Notes { get; set; }
        public bool HasAnomaly { get; set; }
        public string? AnomalyReason { get; set; }
    }

    public class ResponseInspectionLogDto
    {
        public int Id { get; set; }
        public int BinId { get; set; }
        public string BinTag { get; set; } = string.Empty;
        public int? CollectionTaskId { get; set; }
        public int InspectorUserId { get; set; }
        public string InspectorUserName { get; set; } = null!;
        public bool QrCodeScanned { get; set; }
        public int FillLevelPercentage { get; set; }
        public double? MeasuredWeightKg { get; set; }
        public InspectionCondition Condition { get; set; }
        public string? PhotoProofUrl { get; set; }
        public string? Notes { get; set; }
        public bool HasAnomaly { get; set; }
        public string? AnomalyReason { get; set; }
        public bool IsApproved { get; set; }
        public string? ApprovedByUserName { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ApproveInspectionAnomalyDto
    {
        public int InspectionLogId { get; set; }
        public string? ResolutionNotes { get; set; }
    }
}
