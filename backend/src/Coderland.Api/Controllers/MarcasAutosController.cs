using Coderland.Application.Dtos;
using Coderland.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Coderland.Api.Controllers;

[ApiController]
[Route("api/marcas")]
public class MarcasAutosController : ControllerBase
{
    private readonly IMarcaAutoService _service;

    public MarcasAutosController(IMarcaAutoService service) => _service = service;

    /// <summary>Returns all car brands.</summary>
    /// <remarks>
    /// Reads the locally seeded/persisted car-brand catalog (not the external vPIC source — see
    /// <c>GET /api/marcas/externas</c> for the live, read-through data). Always returns the full list; there is
    /// no pagination or filtering.
    /// </remarks>
    /// <param name="cancellationToken">Propagated to the underlying database query.</param>
    /// <response code="200">The full list of car brands, possibly empty.</response>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<MarcaAutoDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<MarcaAutoDto>>> GetAll(CancellationToken cancellationToken)
    {
        var marcas = await _service.GetAllAsync(cancellationToken);
        return Ok(marcas);
    }
}
