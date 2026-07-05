namespace Coderland.Domain.External;

/// <summary>Driven port for a read-only external vehicle catalog (brands + models).</summary>
public interface IVehicleMakesProvider
{
    Task<IReadOnlyList<VehicleMake>> GetMakesAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<VehicleModel>> GetModelsAsync(string make, CancellationToken cancellationToken = default);
}
