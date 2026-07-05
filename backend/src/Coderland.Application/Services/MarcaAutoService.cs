using Coderland.Application.Dtos;
using Coderland.Domain.Repositories;

namespace Coderland.Application.Services;

public class MarcaAutoService : IMarcaAutoService
{
    private readonly IMarcaAutoRepository _repository;

    public MarcaAutoService(IMarcaAutoRepository repository) =>
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));

    public async Task<IReadOnlyList<MarcaAutoDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var marcas = await _repository.GetAllAsync(cancellationToken);
        return marcas
            .Select(m => new MarcaAutoDto(m.Id, m.Nombre, m.PaisOrigen, m.FechaCreacion))
            .ToList();
    }
}
