using Coderland.Application.Dtos;
using Coderland.Domain.Entities;
using Coderland.Domain.Repositories;

namespace Coderland.Application.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _repository;

    public TaskService(ITaskRepository repository) =>
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));

    public async Task<IReadOnlyList<TaskItemDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var tasks = await _repository.GetAllAsync(cancellationToken);
        return tasks.Select(ToDto).ToList();
    }

    public async Task<TaskItemDto> CreateAsync(string descripcion, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(descripcion))
            throw new ArgumentException("Description must not be empty.", nameof(descripcion));

        var entity = new TaskItem { Descripcion = descripcion.Trim(), FechaCreacion = DateTime.UtcNow };
        var saved = await _repository.AddAsync(entity, cancellationToken);
        return ToDto(saved);
    }

    public async Task<SyncResultDto> SyncAsync(IEnumerable<string> descripciones, CancellationToken cancellationToken = default)
    {
        var rawList = descripciones.ToList();
        var incoming = rawList
            .Where(d => !string.IsNullOrWhiteSpace(d))
            .Select(d => d.Trim())
            .ToList();

        var existing = await _repository.GetAllAsync(cancellationToken);
        var existingSet = existing.Select(t => t.Descripcion).ToHashSet(StringComparer.OrdinalIgnoreCase);

        var toAdd = incoming
            .Where(d => existingSet.Add(d)) // HashSet.Add returns false when already present -> dedups incoming too
            .Select(d => new TaskItem { Descripcion = d, FechaCreacion = DateTime.UtcNow })
            .ToList();

        var added = toAdd.Count == 0
            ? (IReadOnlyList<TaskItem>)Array.Empty<TaskItem>()
            : await _repository.AddRangeAsync(toAdd, cancellationToken);

        var skipped = rawList.Count - added.Count; // blanks + duplicates both count as skipped -> reconciles with request
        var all = existing.Concat(added).Select(ToDto).ToList();
        return new SyncResultDto(added.Count, skipped, all);
    }

    private static TaskItemDto ToDto(TaskItem t) => new(t.Id, t.Descripcion, t.FechaCreacion);
}
