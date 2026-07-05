using Coderland.Application.Services;
using Coderland.Domain.External;
using Moq;

namespace Coderland.UnitTests;

public class CatalogoExternoServiceTests
{
    [Fact]
    public async Task GetMarcasExternasAsync_MapsProviderMakesToDtos()
    {
        var provider = new Mock<IVehicleMakesProvider>();
        provider.Setup(p => p.GetMakesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<VehicleMake> { new(448, "TOYOTA") });
        var sut = new CatalogoExternoService(provider.Object);

        var result = await sut.GetMarcasExternasAsync();

        Assert.Single(result);
        Assert.Equal(448, result[0].Id);
        Assert.Equal("TOYOTA", result[0].Nombre);
    }

    [Fact]
    public async Task GetModelosAsync_MapsProviderModelsToDtos()
    {
        var provider = new Mock<IVehicleMakesProvider>();
        provider.Setup(p => p.GetModelsAsync("toyota", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<VehicleModel> { new(2208, "Corolla", "Toyota") });
        var sut = new CatalogoExternoService(provider.Object);

        var result = await sut.GetModelosAsync("toyota");

        Assert.Single(result);
        Assert.Equal("Corolla", result[0].Nombre);
        Assert.Equal("Toyota", result[0].Marca);
    }
}
