using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SmartEcoWaste.Infrastructure.DbContexts;
using SmartEcoWaste.Infrastructure.Middleware;
using SmartEcoWaste.Infrastructure.MultiTenancy;
using SmartEcoWaste.Infrastructure.Seeding;
using SmartEcoWaste.Services.Interfaces;
using SmartEcoWaste.Services.Services;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Configure trusted reverse proxy forwarded headers (X-Forwarded-For, X-Forwarded-Proto)
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Multi-Tenancy Registration
builder.Services.AddScoped<ITenantContextAccessor, TenantContextAccessor>();

builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IBinService, BinService>();
builder.Services.AddScoped<IReportBin,  ReportBinService>();
builder.Services.AddScoped<IPropertyService, PropertyService>();
builder.Services.AddScoped<ICollectionTaskService, CollectionTaskService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();

// Trusted CORS policy: restricted to explicit origins in configuration, with dev fallback
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AppCorsPolicy", policy =>
    {
        if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
        else if (builder.Environment.IsDevelopment())
        {
            policy.WithOrigins("http://localhost:4200", "http://127.0.0.1:4200")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
    });
});

// Periodic background maintenance
builder.Services.AddHostedService<SmartEcoWaste.Api.BackgroundServices.OrphanedUploadCleanupService>();

builder.Services.AddAutoMapper(cfg =>
{
    cfg.AddMaps(AppDomain.CurrentDomain.GetAssemblies());
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// Rate Limiting (Login, Signup, Password Reset, Photo Upload, Public QR Reporting)
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Strict policy for auth endpoints (e.g. 15 requests per minute per IP)
    options.AddPolicy("AuthRateLimit", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 15,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            }));

    // Password reset request limit (5 requests per 15 minutes per IP)
    options.AddPolicy("PasswordResetRateLimit", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 5,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(15)
            }));

    // Photo upload limit (15 requests per minute per IP)
    options.AddPolicy("PhotoUploadRateLimit", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 15,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            }));

    // Public QR report endpoint policy (30 requests per minute per IP)
    options.AddPolicy("PublicReportRateLimit", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 30,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            }));
});

// Add services to the container.
builder.Services.AddDbContext<SmartEcoWasteDbContext>((sp, options) =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString)
    );
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["AppSettings:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["AppSettings:Audience"],
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                System.Text.Encoding.UTF8.GetBytes(builder.Configuration["AppSettings:Token"]!)
            ),
            ClockSkew = TimeSpan.Zero,
        };
    });

var app = builder.Build();

// Fail-fast validation of critical secrets in production environment
if (app.Environment.IsProduction())
{
    var defaultConn = app.Configuration.GetConnectionString("DefaultConnection") ?? "";
    var jwtToken = app.Configuration["AppSettings:Token"] ?? "";

    if (string.IsNullOrWhiteSpace(defaultConn) || defaultConn.Contains("Password=N02123198t."))
    {
        throw new InvalidOperationException("CRITICAL PRODUCTION ERROR: DefaultConnection contains default development credentials. A dedicated database user and secure password must be supplied via environment variables (ConnectionStrings__DefaultConnection) or secret store.");
    }

    if (string.IsNullOrWhiteSpace(jwtToken) || jwtToken.Length < 32 || jwtToken.Contains("MySuperSecureAndRandomKeyThatLooksJustAwesome"))
    {
        throw new InvalidOperationException("CRITICAL PRODUCTION ERROR: AppSettings:Token contains insecure development JWT key. A cryptographically secure secret must be supplied via AppSettings__Token.");
    }
}

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider
        .GetRequiredService<SmartEcoWasteDbContext>();
    var tenantAccessor = scope.ServiceProvider
        .GetRequiredService<ITenantContextAccessor>();

    var seedDemoData = app.Environment.IsDevelopment() &&
                       app.Configuration.GetValue<bool>("SeedDemoData", false);

    await DbSeeder.SeedAsync(dbContext, tenantAccessor, seedDemoData);
}

// Pipeline: Forwarded Headers, Correlation ID & Global Exception Handling first
app.UseForwardedHeaders();
app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<GlobalExceptionHandlingMiddleware>();

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("AppCorsPolicy");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRateLimiter();

app.UseAuthentication();
app.UseMiddleware<AuthMiddleware>();
app.UseMiddleware<TenantMiddleware>();
app.UseAuthorization();
app.MapControllers();

app.Run();

public partial class Program { }
