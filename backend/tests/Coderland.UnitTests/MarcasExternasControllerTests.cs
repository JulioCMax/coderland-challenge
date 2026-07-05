using Coderland.Api.Controllers;
using Coderland.Application.Dtos;
using Coderland.Application.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Coderland.UnitTests;

public class MarcasExternasControllerTests
{
    [Fact]
    public async Task GetMarcas_Returns200WithExternalBrands()
    {
        var service = new Mock<ICatalogoExternoService>();
        service.Setup(s => s.GetMarcasExternasAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<MarcaExternaDto> { new(448, "TOYOTA") });
        var sut = new MarcasExternasController(service.Object);

        var result = await sut.GetMarcas(CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var payload = Assert.IsAssignableFrom<IReadOnlyList<MarcaExternaDto>>(ok.Value);
        Assert.Single(payload);
    }

    [Fact]
    public async Task GetModelos_Returns200WithModels()
    {
        var service = new Mock<ICatalogoExternoService>();
        service.Setup(s => s.GetModelosAsync("toyota", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ModeloExternoDto> { new(2208, "Corolla", "Toyota") });
        var sut = new MarcasExternasController(service.Object);

        var result = await sut.GetModelos("toyota", CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var payload = Assert.IsAssignableFrom<IReadOnlyList<ModeloExternoDto>>(ok.Value);
        Assert.Single(payload);
    }
}
