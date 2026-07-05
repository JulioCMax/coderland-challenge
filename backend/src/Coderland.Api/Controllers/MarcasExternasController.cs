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
    [HttpGet]
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
    [HttpGet("{marca}/modelos")]
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
