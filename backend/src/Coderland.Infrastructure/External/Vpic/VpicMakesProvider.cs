using System.Net.Http.Json;
using Coderland.Domain.External;

namespace Coderland.Infrastructure.External.Vpic;

/// <summary>
/// Read-through adapter over the NHTSA vPIC public API. Never persists; models are
/// fetched on demand per make. Resilience (retry/timeout) is configured on the
/// injected <see cref="HttpClient"/> via the DI registration.
/// </summary>
public class VpicMakesProvider : IVehicleMakesProvider
{
    private readonly HttpClient _http;

    public VpicMakesProvider(HttpClient http) => _http = http;

    public async Task<IReadOnlyList<VehicleMake>> GetMakesAsync(CancellationToken cancellationToken = default)
    {
        var response = await _http.GetFromJsonAsync<VpicMakesResponse>(
            "GetMakesForVehicleType/car?format=json", cancellationToken);

        return response?.Results?
            .Select(r => new VehicleMake(r.MakeId, r.MakeName))
            .ToList() ?? new List<VehicleMake>();
    }

    public async Task<IReadOnlyList<VehicleModel>> GetModelsAsync(string make, CancellationToken cancellationToken = default)
    {
        var safeMake = Uri.EscapeDataString(make);
        var response = await _http.GetFromJsonAsync<VpicModelsResponse>(
            $"GetModelsForMake/{safeMake}?format=json", cancellationToken);

        return response?.Results?
            .Select(r => new VehicleModel(r.ModelId, r.ModelName, r.MakeName))
            .ToList() ?? new List<VehicleModel>();
    }
}
