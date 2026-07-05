using System.Text.Json.Serialization;

namespace Coderland.Infrastructure.External.Vpic;

// vPIC GetMakesForVehicleType/car -> { "Results": [ { "MakeId": 448, "MakeName": "TOYOTA" } ] }
internal sealed class VpicMakesResponse
{
    [JsonPropertyName("Results")] public List<VpicMake> Results { get; set; } = new();
}

internal sealed class VpicMake
{
    [JsonPropertyName("MakeId")] public int MakeId { get; set; }
    [JsonPropertyName("MakeName")] public string MakeName { get; set; } = string.Empty;
}

// vPIC GetModelsForMake/{make} -> { "Results": [ { "Model_ID": 2208, "Model_Name": "Corolla", "Make_Name": "Toyota" } ] }
internal sealed class VpicModelsResponse
{
    [JsonPropertyName("Results")] public List<VpicModel> Results { get; set; } = new();
}

internal sealed class VpicModel
{
    [JsonPropertyName("Model_ID")] public int ModelId { get; set; }
    [JsonPropertyName("Model_Name")] public string ModelName { get; set; } = string.Empty;
    [JsonPropertyName("Make_Name")] public string MakeName { get; set; } = string.Empty;
}
