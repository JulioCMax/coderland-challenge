using Coderland.Application.Dtos;

namespace Coderland.Application.Services;

public interface ITaskService
{
    Task<IReadOnlyList<TaskItemDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<TaskItemDto> CreateAsync(string descripcion, CancellationToken cancellationToken = default);
    Task<SyncResultDto> SyncAsync(IEnumerable<string> descripciones, CancellationToken cancellationToken = default);
}
