using Coderland.Api.Controllers;
using Coderland.Application.Dtos;
using Coderland.Application.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Coderland.UnitTests;

public class MarcasAutosControllerTests
{
    [Fact]
    public async Task GetAll_Returns200WithBrands()
    {
        // Arrange
        var dtos = new List<MarcaAutoDto>
        {
            new(1, "Toyota", "Japan", new DateTime(2024, 1, 1))
        };
        var service = new Mock<IMarcaAutoService>();
        service.Setup(s => s.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(dtos);
        var sut = new MarcasAutosController(service.Object);

        // Act
        var result = await sut.GetAll(CancellationToken.None);

        // Assert
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var payload = Assert.IsAssignableFrom<IReadOnlyList<MarcaAutoDto>>(ok.Value);
        Assert.Single(payload);
        Assert.Equal("Toyota", payload[0].Nombre);
    }
}
