namespace SmartEcoWaste.Data.Enums
{
    public enum ReportStatus
    {
        // Lifecycle states
        Submitted,
        Acknowledged,
        Assigned,
        Resolved,
        Closed,
        Rejected,

        // Legacy statuses kept for backward compatibility
        Emptied,
        Full,
        Overflowing,
        Damaged
    }
}
