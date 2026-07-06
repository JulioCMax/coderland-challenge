using System.Net.Http;
using Coderland.Application.Dtos;
using Coderland.Application.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Coderland.Api.Controllers;

[ApiController]
[Route("api/marcas/externas")]
public class MarcasExternasController : ControllerBase
{
    private readonly ICatalogoExternoService _service;

    public MarcasExternasController(ICatalogoExternoService service) => _service = service;

    /// <summary>Live car brands from the external NHTSA vPIC source (read-through, not persisted).</summary>
    /// <remarks>
    /// Every call fetches fresh data from the external vPIC API — nothing is cached or written to the local
    /// database, so this list is independent from <c>GET /api/marcas</c>. The underlying HTTP client applies
    /// standard resilience policies (retry/timeout/circuit breaker); if the external source still cannot be
    /// reached, a 502 is returned instead of letting the exception propagate.
    /// </remarks>
    /// <param name="cancellationToken">Propagated to the outbound HTTP call to vPIC.</param>
    /// <response code="200">The external brand list as currently reported by vPIC.</response>
    /// <response code="502">The external vPIC source could not be reached.</response>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<MarcaExternaDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status502BadGateway)]
    public async Task<ActionResult<IReadOnlyList<MarcaExternaDto>>> GetMarcas(CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _service.GetMarcasExternasAsync(cancellationToken));
        }
        catch (HttpRequestException)
        {
            return Problem(
                title: "External catalog unavailable",
                detail: "The external vehicle catalog (vPIC) could not be reached. Please try again later.",
                statusCode: StatusCodes.Status502BadGateway);
        }
    }

    /// <summary>Live models for one brand, fetched on demand (read-through, not persisted).</summary>
    /// <remarks>
    /// Fetches models for <paramref name="marca"/> directly from the external vPIC API on every call — no
    /// caching or persistence. As with the brand list, a failure to reach vPIC (after the standard resilience
    /// policies are exhausted) is surfaced as a 502 rather than an unhandled error.
    /// </remarks>
    /// <param name="marca" example="toyota">Brand name to fetch models for, as understood by vPIC.</param>
    /// <param name="cancellationToken">Propagated to the outbound HTTP call to vPIC.</param>
    /// <response code="200">The external model list for the given brand.</response>
    /// <response code="502">The external vPIC source could not be reached.</response>
    [HttpGet("{marca}/modelos")]
    [ProducesResponseType(typeof(IReadOnlyList<ModeloExternoDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status502BadGateway)]
    public async Task<ActionResult<IReadOnlyList<ModeloExternoDto>>> GetModelos(string marca, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _service.GetModelosAsync(marca, cancellationToken));
        }
        catch (HttpRequestException)
        {
            return Problem(
                title: "External catalog unavailable",
                detail: $"Models for '{marca}' could not be retrieved from the external catalog (vPIC).",
                statusCode: StatusCodes.Status502BadGateway);
        }
    }
}
