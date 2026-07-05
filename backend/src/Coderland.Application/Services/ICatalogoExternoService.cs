using Coderland.Application.Dtos;

namespace Coderland.Application.Services;

public interface ICatalogoExternoService
{
    Task<IReadOnlyList<MarcaExternaDto>> GetMarcasExternasAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ModeloExternoDto>> GetModelosAsync(string marca, CancellationToken cancellationToken = default);
}
