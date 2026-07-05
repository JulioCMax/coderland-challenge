using Coderland.Domain.Entities;
using Coderland.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Coderland.Infrastructure.Persistence.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly AppDbContext _context;

    public TaskRepository(AppDbContext context) => _context = context;

    public async Task<IReadOnlyList<TaskItem>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _context.Tasks.AsNoTracking().OrderBy(t => t.Id).ToListAsync(cancellationToken);

    public async Task<TaskItem> AddAsync(TaskItem item, CancellationToken cancellationToken = default)
    {
        _context.Tasks.Add(item);
        await _context.SaveChangesAsync(cancellationToken);
        return item;
    }

    public async Task<IReadOnlyList<TaskItem>> AddRangeAsync(IEnumerable<TaskItem> items, CancellationToken cancellationToken = default)
    {
        var list = items.ToList();
        _context.Tasks.AddRange(list);
        await _context.SaveChangesAsync(cancellationToken);
        return list;
    }
}
