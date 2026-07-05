namespace Coderland.Infrastructure.External.Vpic;

/// <summary>
/// Strongly-typed configuration for the external NHTSA vPIC catalog client.
/// Bound from the "Vpic" configuration section. Defaults live here so the demo
/// runs with no configuration; override via appsettings.json or the environment
/// variable <c>Vpic__BaseUrl</c>.
/// </summary>
public class VpicOptions
{
    public const string SectionName = "Vpic";

    /// <summary>Base address of the vPIC vehicles API (must end with a trailing slash).</summary>
    public string BaseUrl { get; set; } = "https://vpic.nhtsa.dot.gov/api/vehicles/";
}
