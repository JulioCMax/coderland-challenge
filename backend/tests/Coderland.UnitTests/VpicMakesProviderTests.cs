using System.Net;
using System.Text;
using Coderland.Infrastructure.External.Vpic;

namespace Coderland.UnitTests;

public class VpicMakesProviderTests
{
    private static HttpClient ClientReturning(string json)
    {
        var handler = new StubHandler(json);
        return new HttpClient(handler) { BaseAddress = new Uri("https://vpic.nhtsa.dot.gov/api/vehicles/") };
    }

    [Fact]
    public async Task GetMakesAsync_ParsesAndMapsResults()
    {
        const string json = """
        {"Count":2,"Results":[{"MakeId":448,"MakeName":"TOYOTA"},{"MakeId":449,"MakeName":"HONDA"}]}
        """;
        var sut = new VpicMakesProvider(ClientReturning(json));

        var makes = await sut.GetMakesAsync();

        Assert.Equal(2, makes.Count);
        Assert.Equal(448, makes[0].Id);
        Assert.Equal("TOYOTA", makes[0].Nombre);
        Assert.Equal(449, makes[1].Id);
        Assert.Equal("HONDA", makes[1].Nombre);
    }

    [Fact]
    public async Task GetModelsAsync_ParsesUnderscoreFieldsAndMaps()
    {
        const string json = """
        {"Count":1,"Results":[{"Make_ID":448,"Make_Name":"Toyota","Model_ID":2208,"Model_Name":"Corolla"}]}
        """;
        var sut = new VpicMakesProvider(ClientReturning(json));

        var models = await sut.GetModelsAsync("toyota");

        Assert.Single(models);
        Assert.Equal(2208, models[0].Id);
        Assert.Equal("Corolla", models[0].Nombre);
        Assert.Equal("Toyota", models[0].Marca);
    }

    private sealed class StubHandler : HttpMessageHandler
    {
        private readonly string _json;
        public StubHandler(string json) => _json = json;

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) =>
            Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(_json, Encoding.UTF8, "application/json")
            });
    }
}
