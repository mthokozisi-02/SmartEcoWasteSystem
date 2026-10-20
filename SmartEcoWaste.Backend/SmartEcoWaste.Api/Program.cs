using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SmartEcoWaste.Infrastructure.DbContexts;
using SmartEcoWaste.Infrastructure.Middleware;
using SmartEcoWaste.Infrastructure.MultiTenancy;
using SmartEcoWaste.Infrastructure.Seeding;
using SmartEcoWaste.Services.Interfaces;
using SmartEcoWaste.Services.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Multi-Tenancy Registration
builder.Services.AddScoped<ITenantContextAccessor, TenantContextAccessor>();

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IBinService, BinService>();
builder.Services.AddScoped<IReportBin,  ReportBinService>();
builder.Services.AddScoped<IPropertyService, PropertyService>();
builder.Services.AddScoped<ICollectionTaskService, CollectionTaskService>();

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

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider
        .GetRequiredService<SmartEcoWasteDbContext>();

    await DbSeeder.SeedAsync(dbContext);
}

// Configure the HTTP request pipeline.
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors(x => x
    .SetIsOriginAllowed(origin => true)
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials());

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseMiddleware<AuthMiddleware>();
app.UseMiddleware<TenantMiddleware>();
app.UseAuthorization();
app.MapControllers();

app.Run();
