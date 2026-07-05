using Coderland.Application.Dtos;
using Coderland.Domain.External;

namespace Coderland.Application.Services;

public class CatalogoExternoService : ICatalogoExternoService
{
    private readonly IVehicleMakesProvider _provider;

    public CatalogoExternoService(IVehicleMakesProvider provider) =>
        _provider = provider ?? throw new ArgumentNullException(nameof(provider));

    public async Task<IReadOnlyList<MarcaExternaDto>> GetMarcasExternasAsync(CancellationToken cancellationToken = default)
    {
        var makes = await _provider.GetMakesAsync(cancellationToken);
        return makes.Select(m => new MarcaExternaDto(m.Id, m.Nombre)).ToList();
    }

    public async Task<IReadOnlyList<ModeloExternoDto>> GetModelosAsync(string marca, CancellationToken cancellationToken = default)
    {
        var models = await _provider.GetModelsAsync(marca, cancellationToken);
        return models.Select(m => new ModeloExternoDto(m.Id, m.Nombre, m.Marca)).ToList();
    }
}
