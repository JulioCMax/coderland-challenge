using MarcasAutos.Application.Dtos;

namespace MarcasAutos.Application.Services;

public interface IMarcaAutoService
{
    Task<IReadOnlyList<MarcaAutoDto>> GetAllAsync(CancellationToken cancellationToken = default);
}
