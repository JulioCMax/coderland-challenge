using Coderland.Application.Services;
using Coderland.Domain.External;
using Coderland.Domain.Repositories;
using Coderland.Infrastructure.External.Vpic;
using Coderland.Infrastructure.Persistence;
using Coderland.Infrastructure.Persistence.Repositories;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

// --- Persistence ---
// appsettings.json (and the ConnectionStrings__Default env var in containers) is the
// single source of truth for this value; fail fast rather than silently falling back
// to a hardcoded credential if it's ever missing.
var connectionString = builder.Configuration.GetConnectionString("Default");
if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException("Connection string 'Default' is not configured.");
}
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

// --- Dependency inversion: ports -> adapters ---
builder.Services.AddScoped<IMarcaAutoRepository, MarcaAutoRepository>();
builder.Services.AddScoped<IMarcaAutoService, MarcaAutoService>();
builder.Services.AddScoped<ITaskRepository, TaskRepository>();
builder.Services.AddScoped<ITaskService, TaskService>();

builder.Services.Configure<VpicOptions>(builder.Configuration.GetSection(VpicOptions.SectionName));

// External read-through catalog (NHTSA vPIC) — typed client with standard resilience.
// BaseAddress comes from bound VpicOptions (default in the class; override via config/env).
// No HttpClient.Timeout here: the standard resilience handler owns the timeout budget.
builder.Services.AddHttpClient<IVehicleMakesProvider, VpicMakesProvider>((sp, client) =>
{
    var options = sp.GetRequiredService<IOptions<VpicOptions>>().Value;
    client.BaseAddress = new Uri(options.BaseUrl);
})
.AddStandardResilienceHandler();

builder.Services.AddScoped<ICatalogoExternoService, CatalogoExternoService>();

// --- Web ---
builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    var xml = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xml);
    if (File.Exists(xmlPath)) options.IncludeXmlComments(xmlPath);
});

// --- Health checks (includes PostgreSQL connectivity) ---
builder.Services.AddHealthChecks()
    .AddCheck("self", () => HealthCheckResult.Healthy(), tags: new[] { "live" })
    .AddNpgSql(connectionString, name: "postgres", tags: new[] { "ready" });

var app = builder.Build();

// Apply migrations + seed on startup, but only for a relational provider
// (the in-memory provider used in tests is not relational).
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (db.Database.IsRelational())
    {
        db.Database.Migrate();
    }
}

app.UseExceptionHandler();

// Swagger is enabled in all environments for the demo.
app.UseSwagger();
app.UseSwaggerUI();

app.MapControllers();
app.MapHealthChecks("/health");
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("live")
});
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});

app.Run();

// Exposed so the integration test project (WebApplicationFactory) can bootstrap the app.
public partial class Program { }
