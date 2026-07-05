using Coderland.Application.Dtos;

namespace Coderland.Application.Services;

public interface IMarcaAutoService
{
    Task<IReadOnlyList<MarcaAutoDto>> GetAllAsync(CancellationToken cancellationToken = default);
}
