using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace SmartEcoWaste.Infrastructure.Middleware
{
    public class CorrelationIdMiddleware
    {
        public const string CorrelationIdHeader = "X-Correlation-ID";
        private readonly RequestDelegate _next;
        private readonly ILogger<CorrelationIdMiddleware> _logger;

        public CorrelationIdMiddleware(RequestDelegate next, ILogger<CorrelationIdMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (!context.Request.Headers.TryGetValue(CorrelationIdHeader, out var correlationId) || string.IsNullOrWhiteSpace(correlationId))
            {
                correlationId = Guid.NewGuid().ToString("N");
            }

            context.Items[CorrelationIdHeader] = correlationId.ToString();
            context.Response.Headers[CorrelationIdHeader] = correlationId.ToString();

            using (_logger.BeginScope("{@CorrelationId}", correlationId))
            {
                await _next(context);
            }
        }
    }
}
