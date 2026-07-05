using Coderland.Domain.Entities;

namespace Coderland.Domain.Repositories;

/// <summary>Outbound port for reading and writing <see cref="MarcaAuto"/> aggregates.</summary>
public interface IMarcaAutoRepository
{
    Task<IReadOnlyList<MarcaAuto>> GetAllAsync(CancellationToken cancellationToken = default);
}
