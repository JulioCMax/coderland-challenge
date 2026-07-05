using Coderland.Domain.Entities;

namespace Coderland.Domain.Repositories;

/// <summary>Outbound port for reading and writing <see cref="TaskItem"/> aggregates.</summary>
public interface ITaskRepository
{
    Task<IReadOnlyList<TaskItem>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<TaskItem> AddAsync(TaskItem item, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TaskItem>> AddRangeAsync(IEnumerable<TaskItem> items, CancellationToken cancellationToken = default);
}
