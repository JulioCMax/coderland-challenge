using Coderland.Domain.Entities;
using Coderland.Infrastructure.Persistence;
using Coderland.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Coderland.IntegrationTests;

public class MarcaAutoRepositoryTests
{
    private static AppDbContext NewContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"repo-{Guid.NewGuid()}")
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsInsertedBrandsOrderedById()
    {
        await using var ctx = NewContext();
        ctx.MarcasAutos.AddRange(
            new MarcaAuto { Id = 2, Nombre = "Ford", FechaCreacion = new DateTime(2024, 1, 1) },
            new MarcaAuto { Id = 1, Nombre = "Toyota", FechaCreacion = new DateTime(2024, 1, 1) });
        await ctx.SaveChangesAsync();
        var sut = new MarcaAutoRepository(ctx);

        var result = await sut.GetAllAsync();

        Assert.Equal(2, result.Count);
        Assert.Equal("Toyota", result[0].Nombre); // ordered by Id
    }

    [Fact]
    public async Task GetAllAsync_ReturnsEmptyList_WhenNoBrandsExist()
    {
        await using var ctx = NewContext();
        var sut = new MarcaAutoRepository(ctx);

        var result = await sut.GetAllAsync();

        Assert.Empty(result);
    }
}
