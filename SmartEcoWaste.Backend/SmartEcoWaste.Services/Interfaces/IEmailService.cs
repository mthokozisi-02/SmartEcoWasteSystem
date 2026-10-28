using System.Threading.Tasks;

namespace SmartEcoWaste.Services.Interfaces
{
    public interface IEmailService
    {
        Task<bool> SendEmailAsync(string toEmail, string subject, string body, bool isHtml = true);
        Task<bool> SendEmailConfirmationAsync(string toEmail, string userName, string confirmationLink);
        Task<bool> SendPasswordResetAsync(string toEmail, string userName, string resetLink);
        Task<bool> SendAccountApprovedAsync(string toEmail, string userName, string organizationName, string? loginUrl = null);
        Task<bool> SendRegistrationPendingAsync(string toEmail, string userName, string organizationName);
        Task<bool> SendTaskAssignedNotificationAsync(string staffEmail, string staffName, string taskTitle, string? binTag, string? location, string? instructions, System.DateTime? dueDate, string? tasksUrl = null);
        Task<bool> SendBinReportedNotificationAsync(string adminEmail, string adminName, string binTag, string status, string? location, string? reporterName, string? photoUrl = null, string? reportsUrl = null);
    }
}
