using System.Net;
using System.Net.Http.Json;
using Coderland.Application.Dtos;

namespace Coderland.IntegrationTests;

public class MarcasEndpointTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public MarcasEndpointTests(CustomWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task GetMarcas_ReturnsSeededBrands()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/marcas");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var marcas = await response.Content.ReadFromJsonAsync<List<MarcaAutoDto>>();
        Assert.NotNull(marcas);
        Assert.Equal(3, marcas!.Count);
        Assert.Contains(marcas, m => m.Nombre == "Toyota");
        Assert.Contains(marcas, m => m.Nombre == "Ford");
        Assert.Contains(marcas, m => m.Nombre == "Volkswagen");
    }
}
