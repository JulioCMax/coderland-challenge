using Coderland.Application.Services;
using Coderland.Domain.Repositories;
using Coderland.Infrastructure.Persistence;
using Coderland.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;

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

// --- Web ---
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- Health checks (includes PostgreSQL connectivity) ---
builder.Services.AddHealthChecks().AddNpgSql(connectionString, name: "postgres");

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

// Swagger is enabled in all environments for the demo.
app.UseSwagger();
app.UseSwaggerUI();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();

// Exposed so the integration test project (WebApplicationFactory) can bootstrap the app.
public partial class Program { }
