using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SmartEcoWaste.Infrastructure.DbContexts;
using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SmartEcoWaste.Api.BackgroundServices
{
    /// <summary>
    /// Periodic maintenance service to purge orphaned or abandoned photo uploads older than 24 hours
    /// that are not linked to any committed report in the database.
    /// </summary>
    public class OrphanedUploadCleanupService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<OrphanedUploadCleanupService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromHours(12);
        private readonly TimeSpan _retentionPeriod = TimeSpan.FromHours(24);

        public OrphanedUploadCleanupService(
            IServiceProvider serviceProvider,
            IWebHostEnvironment environment,
            ILogger<OrphanedUploadCleanupService> logger)
        {
            _serviceProvider = serviceProvider;
            _environment = environment;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // Initial delay before first run
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CleanOrphanedUploadsAsync(stoppingToken);
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    _logger.LogError(ex, "Error occurred during orphaned upload cleanup execution.");
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }
        }

        private async Task CleanOrphanedUploadsAsync(CancellationToken cancellationToken)
        {
            var webRoot = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsDir = Path.Combine(webRoot, "uploads", "reports");

            if (!Directory.Exists(uploadsDir))
            {
                return;
            }

            var cutoffTime = DateTime.UtcNow - _retentionPeriod;
            var directoryInfo = new DirectoryInfo(uploadsDir);
            var candidateFiles = directoryInfo.GetFiles()
                .Where(f => f.CreationTimeUtc < cutoffTime && f.LastWriteTimeUtc < cutoffTime)
                .ToList();

            if (!candidateFiles.Any())
            {
                return;
            }

            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<SmartEcoWasteDbContext>();

            // Query active report photo URLs across all tenants
            var activePhotoUrls = await dbContext.Reports
                .IgnoreQueryFilters()
                .Where(r => !string.IsNullOrEmpty(r.PhotoUrl))
                .Select(r => r.PhotoUrl)
                .Distinct()
                .ToListAsync(cancellationToken);

            var activeFileNames = activePhotoUrls
                .Select(url => Path.GetFileName(url))
                .Where(name => !string.IsNullOrEmpty(name))
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            var deletedCount = 0;
            foreach (var file in candidateFiles)
            {
                if (cancellationToken.IsCancellationRequested) break;

                if (!activeFileNames.Contains(file.Name))
                {
                    try
                    {
                        file.Delete();
                        deletedCount++;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to delete orphaned file: {FileName}", file.Name);
                    }
                }
            }

            if (deletedCount > 0)
            {
                _logger.LogInformation("Purged {Count} orphaned upload file(s) from {Directory}.", deletedCount, uploadsDir);
            }
        }
    }
}
