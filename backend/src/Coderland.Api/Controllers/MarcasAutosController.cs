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
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<MarcaAutoDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<MarcaAutoDto>>> GetAll(CancellationToken cancellationToken)
    {
        var marcas = await _service.GetAllAsync(cancellationToken);
        return Ok(marcas);
    }
}
