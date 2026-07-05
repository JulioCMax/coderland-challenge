using Coderland.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Coderland.Infrastructure.Persistence.Configurations;

public class MarcaAutoConfiguration : IEntityTypeConfiguration<MarcaAuto>
{
    private const int MaxNameLength = 100;

    // Fixed timestamp so HasData produces a deterministic migration (no DateTime.UtcNow).
    private static readonly DateTime SeedDate = new(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);

    public void Configure(EntityTypeBuilder<MarcaAuto> builder)
    {
        // PDF requirement: the table must be named "MarcasAutos".
        builder.ToTable("MarcasAutos");
        builder.HasKey(m => m.Id);

        builder.Property(m => m.Nombre).IsRequired().HasMaxLength(MaxNameLength);
        builder.Property(m => m.PaisOrigen).HasMaxLength(MaxNameLength);
        builder.Property(m => m.FechaCreacion).IsRequired();

        builder.HasIndex(m => m.Nombre).IsUnique();

        builder.HasData(
            new MarcaAuto { Id = 1, Nombre = "Toyota", PaisOrigen = "Japan", FechaCreacion = SeedDate },
            new MarcaAuto { Id = 2, Nombre = "Ford", PaisOrigen = "United States", FechaCreacion = SeedDate },
            new MarcaAuto { Id = 3, Nombre = "Volkswagen", PaisOrigen = "Germany", FechaCreacion = SeedDate });
    }
}
