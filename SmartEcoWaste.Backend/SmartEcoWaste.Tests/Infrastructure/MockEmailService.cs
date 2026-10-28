using SmartEcoWaste.Services.Interfaces;
using System.Collections.Concurrent;
using System.Threading.Tasks;

namespace SmartEcoWaste.Tests.Infrastructure
{
    public class MockEmailService : IEmailService
    {
        public ConcurrentBag<(string toEmail, string subject)> SentEmails { get; } = new();
        public ConcurrentBag<(string staffEmail, string taskTitle, string? binTag)> AssignedTasks { get; } = new();
        public ConcurrentBag<(string adminEmail, string binTag, string status)> ReportedBins { get; } = new();

        public Task<bool> SendEmailAsync(string toEmail, string subject, string body, bool isHtml = true)
        {
            SentEmails.Add((toEmail, subject));
            return Task.FromResult(true);
        }

        public Task<bool> SendEmailConfirmationAsync(string toEmail, string userName, string confirmationLink)
        {
            SentEmails.Add((toEmail, "Confirmation"));
            return Task.FromResult(true);
        }

        public Task<bool> SendPasswordResetAsync(string toEmail, string userName, string resetLink)
        {
            SentEmails.Add((toEmail, "PasswordReset"));
            return Task.FromResult(true);
        }

        public Task<bool> SendAccountApprovedAsync(string toEmail, string userName, string organizationName, string? loginUrl = null)
        {
            SentEmails.Add((toEmail, "Approved"));
            return Task.FromResult(true);
        }

        public Task<bool> SendRegistrationPendingAsync(string toEmail, string userName, string organizationName)
        {
            SentEmails.Add((toEmail, "Pending"));
            return Task.FromResult(true);
        }

        public Task<bool> SendTaskAssignedNotificationAsync(string staffEmail, string staffName, string taskTitle, string? binTag, string? location, string? instructions, System.DateTime? dueDate, string? tasksUrl = null)
        {
            AssignedTasks.Add((staffEmail, taskTitle, binTag));
            SentEmails.Add((staffEmail, $"TaskAssigned: {taskTitle}"));
            return Task.FromResult(true);
        }

        public Task<bool> SendBinReportedNotificationAsync(string adminEmail, string adminName, string binTag, string status, string? location, string? reporterName, string? photoUrl = null, string? reportsUrl = null)
        {
            ReportedBins.Add((adminEmail, binTag, status));
            SentEmails.Add((adminEmail, $"BinReported: {binTag}"));
            return Task.FromResult(true);
        }
    }
}
