using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SmartEcoWaste.Services.Interfaces;
using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace SmartEcoWaste.Services.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> SendEmailAsync(string toEmail, string subject, string body, bool isHtml = true)
        {
            try
            {
                var host = _configuration["Smtp:Host"] ?? _configuration["EmailSettings:EmailHost"] ?? "smtp.gmail.com";
                var portStr = _configuration["Smtp:Port"] ?? _configuration["EmailSettings:EmailPort"] ?? "587";
                var port = int.TryParse(portStr, out var p) ? p : 587;
                var username = _configuration["Smtp:Username"] ?? _configuration["EmailSettings:EmailUsername"] ?? "mthokozisi@dawningcare.co.uk";
                var password = _configuration["Smtp:Password"] ?? _configuration["EmailSettings:EmailPassword"] ?? "N02123198t.";
                var senderEmail = _configuration["Smtp:FromAddress"] ?? _configuration["EmailSettings:SenderEmail"] ?? username;
                var senderName = _configuration["Smtp:SenderName"] ?? _configuration["EmailSettings:SenderName"] ?? "Smart Eco Waste System";
                var enableSsl = bool.TryParse(_configuration["Smtp:EnableSsl"] ?? _configuration["EmailSettings:EnableSsl"], out var ssl) ? ssl : true;

                using var client = new SmtpClient(host, port)
                {
                    Credentials = new NetworkCredential(username, password),
                    EnableSsl = enableSsl,
                    Timeout = 15000 // 15 seconds timeout
                };

                using var mailMessage = new MailMessage
                {
                    From = new MailAddress(senderEmail, senderName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = isHtml
                };

                mailMessage.To.Add(toEmail);

                await client.SendMailAsync(mailMessage);
                _logger.LogInformation("Email sent successfully to {ToEmail} with subject '{Subject}'", toEmail, subject);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {ToEmail} with subject '{Subject}'", toEmail, subject);
                return false;
            }
        }

        public async Task<bool> SendEmailConfirmationAsync(string toEmail, string userName, string confirmationLink)
        {
            var subject = "Verify Your SmartEcoWaste Account";
            var body = $@"
<!DOCTYPE html>
<html>
<head>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }}
    .container {{ max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }}
    .header {{ text-align: center; margin-bottom: 24px; }}
    .logo-badge {{ display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: #10b981; color: white; line-height: 48px; font-size: 24px; font-weight: bold; margin-bottom: 12px; }}
    h1 {{ font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 8px; }}
    p {{ font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px; }}
    .button-wrap {{ text-align: center; margin: 28px 0; }}
    .btn {{ display: inline-block; padding: 12px 28px; background: #10b981; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(16,185,129,0.3); }}
    .footer {{ margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center; }}
    .warning {{ font-size: 12px; color: #64748b; background: #f1f5f9; padding: 12px; border-radius: 8px; margin-top: 16px; }}
  </style>
</head>
<body>
  <div class='container'>
    <div class='header'>
      <div class='logo-badge'>♻</div>
      <h1>Verify Your Email Address</h1>
      <p>Welcome to SmartEcoWaste, <strong>{WebUtility.HtmlEncode(userName)}</strong>!</p>
    </div>
    <p>Thank you for registering. To protect the security of your account and activate your access to SmartEcoWaste, please confirm your email address by clicking the button below:</p>
    <div class='button-wrap'>
      <a href='{confirmationLink}' class='btn' target='_blank'>Verify Email Address</a>
    </div>
    <div class='warning'>
      This verification link is single-use and will expire in 24 hours. If you did not create an account on SmartEcoWaste, please disregard this email.
    </div>
    <div class='footer'>
      &copy; {DateTime.UtcNow.Year} SmartEcoWaste System. All rights reserved.
    </div>
  </div>
</body>
</html>";

            return await SendEmailAsync(toEmail, subject, body, true);
        }

        public async Task<bool> SendPasswordResetAsync(string toEmail, string userName, string resetLink)
        {
            var subject = "Password Reset Request - SmartEcoWaste";
            var body = $@"
<!DOCTYPE html>
<html>
<head>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }}
    .container {{ max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }}
    .header {{ text-align: center; margin-bottom: 24px; }}
    .logo-badge {{ display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: #10b981; color: white; line-height: 48px; font-size: 24px; font-weight: bold; margin-bottom: 12px; }}
    h1 {{ font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 8px; }}
    p {{ font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px; }}
    .button-wrap {{ text-align: center; margin: 28px 0; }}
    .btn {{ display: inline-block; padding: 12px 28px; background: #0284c7; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(2,132,199,0.3); }}
    .footer {{ margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center; }}
    .warning {{ font-size: 12px; color: #64748b; background: #f1f5f9; padding: 12px; border-radius: 8px; margin-top: 16px; }}
  </style>
</head>
<body>
  <div class='container'>
    <div class='header'>
      <div class='logo-badge'>🔑</div>
      <h1>Password Reset Request</h1>
      <p>Hello <strong>{WebUtility.HtmlEncode(userName)}</strong>,</p>
    </div>
    <p>We received a request to reset your SmartEcoWaste account password. Click the button below to choose a new password:</p>
    <div class='button-wrap'>
      <a href='{resetLink}' class='btn' target='_blank'>Reset Password</a>
    </div>
    <div class='warning'>
      This password reset link is single-use and expires in 1 hour. If you did not request a password reset, you can safely ignore this email; your password will remain unchanged.
    </div>
    <div class='footer'>
      &copy; {DateTime.UtcNow.Year} SmartEcoWaste System. All rights reserved.
    </div>
  </div>
</body>
</html>";

            return await SendEmailAsync(toEmail, subject, body, true);
        }

        public async Task<bool> SendRegistrationPendingAsync(string toEmail, string userName, string organizationName)
        {
            var subject = "SmartEcoWaste Registration Received - Awaiting Approval";
            var body = $@"
<!DOCTYPE html>
<html>
<head>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }}
    .container {{ max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }}
    .header {{ text-align: center; margin-bottom: 24px; }}
    .logo-badge {{ display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: #f59e0b; color: white; line-height: 48px; font-size: 24px; font-weight: bold; margin-bottom: 12px; }}
    h1 {{ font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 8px; }}
    p {{ font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px; }}
    .status-badge {{ display: inline-block; padding: 6px 16px; background: #fef3c7; color: #b45309; border-radius: 20px; font-weight: 700; font-size: 13px; margin: 12px 0 20px; }}
    .footer {{ margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center; }}
    .notice {{ font-size: 13px; color: #475569; background: #f8fafc; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 8px; margin: 20px 0; }}
  </style>
</head>
<body>
  <div class='container'>
    <div class='header'>
      <div class='logo-badge'>⏳</div>
      <h1>Registration Received</h1>
      <span class='status-badge'>Pending Administrator Approval</span>
      <p>Hello <strong>{WebUtility.HtmlEncode(userName)}</strong>,</p>
    </div>
    <p>Thank you for creating an account with SmartEcoWaste under <strong>{WebUtility.HtmlEncode(organizationName)}</strong>.</p>
    <div class='notice'>
      <strong>What happens next?</strong><br>
      Your account is currently waiting to be reviewed and approved by an authorized organization administrator.
      Once approved, you will receive an email confirmation and will be able to log in immediately.
    </div>
    <div class='footer'>
      &copy; {DateTime.UtcNow.Year} SmartEcoWaste System. All rights reserved.
    </div>
  </div>
</body>
</html>";

            return await SendEmailAsync(toEmail, subject, body, true);
        }

        public async Task<bool> SendAccountApprovedAsync(string toEmail, string userName, string organizationName, string? loginUrl = null)
        {
            var resolvedLoginUrl = !string.IsNullOrEmpty(loginUrl) 
                ? loginUrl 
                : (_configuration["AppSettings:ClientBaseUrl"] ?? "http://localhost:4200").TrimEnd('/') + "/auth/login";

            var subject = "Your SmartEcoWaste Account Has Been Approved - Ready to Login";
            var body = $@"
<!DOCTYPE html>
<html>
<head>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }}
    .container {{ max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }}
    .header {{ text-align: center; margin-bottom: 24px; }}
    .logo-badge {{ display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: #10b981; color: white; line-height: 48px; font-size: 24px; font-weight: bold; margin-bottom: 12px; }}
    h1 {{ font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 8px; }}
    p {{ font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px; }}
    .button-wrap {{ text-align: center; margin: 28px 0; }}
    .btn {{ display: inline-block; padding: 12px 28px; background: #10b981; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(16,185,129,0.3); }}
    .footer {{ margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center; }}
    .info {{ font-size: 13px; color: #065f46; background: #ecfdf5; border-left: 4px solid #10b981; padding: 14px 18px; border-radius: 8px; margin: 20px 0; }}
  </style>
</head>
<body>
  <div class='container'>
    <div class='header'>
      <div class='logo-badge'>✓</div>
      <h1>Account Approved!</h1>
      <p>Hello <strong>{WebUtility.HtmlEncode(userName)}</strong>,</p>
    </div>
    <div class='info'>
      Great news! Your SmartEcoWaste account has been reviewed and approved by the organization administrator for <strong>{WebUtility.HtmlEncode(organizationName)}</strong>.
    </div>
    <p>Your account is now fully active. You can sign in using your email address and password to start reporting bins, accessing services, and earning rewards.</p>
    <div class='button-wrap'>
      <a href='{resolvedLoginUrl}' class='btn' target='_blank'>Log In to Your Account</a>
    </div>
    <div class='footer'>
      &copy; {DateTime.UtcNow.Year} SmartEcoWaste System. All rights reserved.
    </div>
  </div>
</body>
</html>";

            return await SendEmailAsync(toEmail, subject, body, true);
        }

        public async Task<bool> SendTaskAssignedNotificationAsync(
            string staffEmail,
            string staffName,
            string taskTitle,
            string? binTag,
            string? location,
            string? instructions,
            DateTime? dueDate,
            string? tasksUrl = null)
        {
            var resolvedTasksUrl = !string.IsNullOrEmpty(tasksUrl)
                ? tasksUrl
                : (_configuration["AppSettings:ClientBaseUrl"] ?? "http://localhost:4200").TrimEnd('/') + "/manage-tasks";

            var subject = $"📋 New Task Assigned: {taskTitle}";
            var dueDateStr = dueDate.HasValue ? dueDate.Value.ToString("yyyy-MM-dd HH:mm UTC") : "As soon as possible";
            var locationStr = !string.IsNullOrWhiteSpace(location) ? location : "Assigned Bin Location";
            var binStr = !string.IsNullOrWhiteSpace(binTag) ? binTag : "Unspecified";
            var instructionsStr = !string.IsNullOrWhiteSpace(instructions) ? instructions : "Please inspect and collect waste for the designated bin.";

            var body = $@"
<!DOCTYPE html>
<html>
<head>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }}
    .container {{ max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }}
    .header {{ text-align: center; margin-bottom: 24px; }}
    .logo-badge {{ display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: #0284c7; color: white; line-height: 48px; font-size: 24px; font-weight: bold; margin-bottom: 12px; }}
    h1 {{ font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 8px; }}
    p {{ font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px; }}
    .task-card {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; }}
    .task-item {{ display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; }}
    .task-item:last-child {{ border-bottom: none; }}
    .item-label {{ color: #64748b; font-weight: 600; }}
    .item-value {{ color: #0f172a; font-weight: 700; text-align: right; }}
    .instructions-box {{ background: #eff6ff; border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 8px; margin-top: 14px; font-size: 13px; color: #1e40af; }}
    .button-wrap {{ text-align: center; margin: 28px 0; }}
    .btn {{ display: inline-block; padding: 12px 28px; background: #0284c7; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(2,132,199,0.3); }}
    .footer {{ margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center; }}
  </style>
</head>
<body>
  <div class='container'>
    <div class='header'>
      <div class='logo-badge'>📋</div>
      <h1>New Task Assigned</h1>
      <p>Hello <strong>{WebUtility.HtmlEncode(staffName)}</strong>,</p>
    </div>
    <p>A new collection / inspection task has been assigned to you by your organization administrator:</p>
    <div class='task-card'>
      <div class='task-item'>
        <span class='item-label'>Task Title</span>
        <span class='item-value'>{WebUtility.HtmlEncode(taskTitle)}</span>
      </div>
      <div class='task-item'>
        <span class='item-label'>Target Bin</span>
        <span class='item-value'>{WebUtility.HtmlEncode(binStr)}</span>
      </div>
      <div class='task-item'>
        <span class='item-label'>Location / Area</span>
        <span class='item-value'>{WebUtility.HtmlEncode(locationStr)}</span>
      </div>
      <div class='task-item'>
        <span class='item-label'>Due Date</span>
        <span class='item-value'>{WebUtility.HtmlEncode(dueDateStr)}</span>
      </div>
      <div class='instructions-box'>
        <strong>Instructions:</strong><br>
        {WebUtility.HtmlEncode(instructionsStr)}
      </div>
    </div>
    <div class='button-wrap'>
      <a href='{resolvedTasksUrl}' class='btn' target='_blank'>View & Update Task in Portal</a>
    </div>
    <div class='footer'>
      &copy; {DateTime.UtcNow.Year} SmartEcoWaste System. All rights reserved.
    </div>
  </div>
</body>
</html>";

            return await SendEmailAsync(staffEmail, subject, body, true);
        }

        public async Task<bool> SendBinReportedNotificationAsync(
            string adminEmail,
            string adminName,
            string binTag,
            string status,
            string? location,
            string? reporterName,
            string? photoUrl = null,
            string? reportsUrl = null)
        {
            var resolvedReportsUrl = !string.IsNullOrEmpty(reportsUrl)
                ? reportsUrl
                : (_configuration["AppSettings:ClientBaseUrl"] ?? "http://localhost:4200").TrimEnd('/') + "/manage-reports";

            var subject = $"⚠️ Alert: Bin #{binTag} Reported as {status}";
            var locationStr = !string.IsNullOrWhiteSpace(location) ? location : "Designated Location";
            var reporterStr = !string.IsNullOrWhiteSpace(reporterName) ? reporterName : "Anonymous Citizen";
            var timestampStr = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm UTC");

            var body = $@"
<!DOCTYPE html>
<html>
<head>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }}
    .container {{ max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }}
    .header {{ text-align: center; margin-bottom: 24px; }}
    .logo-badge {{ display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: #ef4444; color: white; line-height: 48px; font-size: 24px; font-weight: bold; margin-bottom: 12px; }}
    h1 {{ font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 8px; }}
    p {{ font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px; }}
    .alert-card {{ background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin: 20px 0; }}
    .alert-item {{ display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #fecaca; font-size: 13px; }}
    .alert-item:last-child {{ border-bottom: none; }}
    .item-label {{ color: #991b1b; font-weight: 600; }}
    .item-value {{ color: #7f1d1d; font-weight: 700; text-align: right; }}
    .status-badge {{ display: inline-block; padding: 4px 12px; background: #fee2e2; color: #b91c1c; border-radius: 20px; font-weight: 800; font-size: 12px; text-transform: uppercase; }}
    .button-wrap {{ text-align: center; margin: 28px 0; }}
    .btn {{ display: inline-block; padding: 12px 28px; background: #ef4444; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(239,68,68,0.3); }}
    .footer {{ margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center; }}
  </style>
</head>
<body>
  <div class='container'>
    <div class='header'>
      <div class='logo-badge'>⚠️</div>
      <h1>Bin Issue Reported</h1>
      <p>Hello <strong>{WebUtility.HtmlEncode(adminName)}</strong>,</p>
    </div>
    <p>A bin in your organization workspace has been reported and requires review or collection dispatch:</p>
    <div class='alert-card'>
      <div class='alert-item'>
        <span class='item-label'>Bin Tag / ID</span>
        <span class='item-value'>{WebUtility.HtmlEncode(binTag)}</span>
      </div>
      <div class='alert-item'>
        <span class='item-label'>Condition Reported</span>
        <span class='item-value'><span class='status-badge'>{WebUtility.HtmlEncode(status)}</span></span>
      </div>
      <div class='alert-item'>
        <span class='item-label'>Location / Area</span>
        <span class='item-value'>{WebUtility.HtmlEncode(locationStr)}</span>
      </div>
      <div class='alert-item'>
        <span class='item-label'>Reported By</span>
        <span class='item-value'>{WebUtility.HtmlEncode(reporterStr)}</span>
      </div>
      <div class='alert-item'>
        <span class='item-label'>Reported At</span>
        <span class='item-value'>{WebUtility.HtmlEncode(timestampStr)}</span>
      </div>
    </div>
    <div class='button-wrap'>
      <a href='{resolvedReportsUrl}' class='btn' target='_blank'>Review & Assign Staff in Portal</a>
    </div>
    <div class='footer'>
      &copy; {DateTime.UtcNow.Year} SmartEcoWaste System. All rights reserved.
    </div>
  </div>
</body>
</html>";

            return await SendEmailAsync(adminEmail, subject, body, true);
        }
    }
}
