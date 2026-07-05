using Coderland.Domain.Entities;
using Coderland.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Coderland.Infrastructure.Persistence.Repositories;

public class MarcaAutoRepository : IMarcaAutoRepository
{
    private readonly AppDbContext _context;

    public MarcaAutoRepository(AppDbContext context) => _context = context;

    public async Task<IReadOnlyList<MarcaAuto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.MarcasAutos
            .AsNoTracking()
            .OrderBy(m => m.Id)
            .ToListAsync(cancellationToken);
    }
}
