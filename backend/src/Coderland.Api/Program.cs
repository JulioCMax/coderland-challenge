using Coderland.Application.Services;
using Coderland.Domain.Repositories;
using Coderland.Infrastructure.Persistence;
using Coderland.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// --- Persistence ---
var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? "Host=localhost;Port=5432;Database=marcasautos;Username=postgres;Password=postgres";
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

// --- Dependency inversion: ports -> adapters ---
builder.Services.AddScoped<IMarcaAutoRepository, MarcaAutoRepository>();
builder.Services.AddScoped<IMarcaAutoService, MarcaAutoService>();

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
