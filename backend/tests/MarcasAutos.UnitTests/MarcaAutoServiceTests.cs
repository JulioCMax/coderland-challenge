using MarcasAutos.Application.Services;
using MarcasAutos.Domain.Entities;
using MarcasAutos.Domain.Repositories;
using Moq;

namespace MarcasAutos.UnitTests;

public class MarcaAutoServiceTests
{
    [Fact]
    public async Task GetAllAsync_MapsEntitiesToDtos()
    {
        // Arrange
        var entities = new List<MarcaAuto>
        {
            new() { Id = 1, Nombre = "Toyota", PaisOrigen = "Japan", FechaCreacion = new DateTime(2024, 1, 1) }
        };
        var repo = new Mock<IMarcaAutoRepository>();
        repo.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(entities);
        var sut = new MarcaAutoService(repo.Object);

        // Act
        var result = await sut.GetAllAsync();

        // Assert
        Assert.Single(result);
        Assert.Equal(1, result[0].Id);
        Assert.Equal("Toyota", result[0].Nombre);
        Assert.Equal("Japan", result[0].PaisOrigen);
        Assert.Equal(new DateTime(2024, 1, 1), result[0].FechaCreacion);
    }
}
