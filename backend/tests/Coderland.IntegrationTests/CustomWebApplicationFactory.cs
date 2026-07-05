using Coderland.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Coderland.IntegrationTests;

/// <summary>
/// Boots the real API pipeline but swaps PostgreSQL for the EF Core in-memory
/// provider (satisfies the PDF "in-memory DB context" requirement).
/// </summary>
public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove every Npgsql-backed registration for AppDbContext. Removing only
            // DbContextOptions<AppDbContext> is not enough: EF Core also registers an
            // IDbContextOptionsConfiguration<AppDbContext> per AddDbContext call, and those
            // accumulate instead of being replaced, so a second AddDbContext call would apply
            // both the Npgsql and the in-memory configuration to the same options instance.
            var descriptorsToRemove = services
                .Where(d => d.ServiceType == typeof(AppDbContext)
                    || (d.ServiceType.IsGenericType && d.ServiceType.GetGenericArguments().Contains(typeof(AppDbContext))))
                .ToList();
            foreach (var descriptor in descriptorsToRemove) services.Remove(descriptor);

            // Register the in-memory provider instead.
            services.AddDbContext<AppDbContext>(o => o.UseInMemoryDatabase("MarcasAutosTests"));

            // Create the schema + apply HasData seed for the in-memory database.
            using var scope = services.BuildServiceProvider().CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.EnsureCreated();
        });
    }
}
