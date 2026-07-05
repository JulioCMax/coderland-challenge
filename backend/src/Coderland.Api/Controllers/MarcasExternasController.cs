using Coderland.Application.Dtos;
using Coderland.Application.Services;
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
    public async Task<ActionResult<IReadOnlyList<MarcaExternaDto>>> GetMarcas(CancellationToken cancellationToken) =>
        Ok(await _service.GetMarcasExternasAsync(cancellationToken));

    /// <summary>Live models for one brand, fetched on demand (read-through, not persisted).</summary>
    [HttpGet("{marca}/modelos")]
    public async Task<ActionResult<IReadOnlyList<ModeloExternoDto>>> GetModelos(string marca, CancellationToken cancellationToken) =>
        Ok(await _service.GetModelosAsync(marca, cancellationToken));
}
