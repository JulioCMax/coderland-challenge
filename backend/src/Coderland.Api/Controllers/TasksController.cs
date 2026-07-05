using Coderland.Application.Dtos;
using Coderland.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Coderland.Api.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _service;

    public TasksController(ITaskService service) => _service = service;

    /// <summary>Lists all tasks (used by the mobile client to pull on sync).</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TaskItemDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await _service.GetAllAsync(cancellationToken));

    /// <summary>Creates a single task. Rejects an empty description.</summary>
    [HttpPost]
    public async Task<ActionResult<TaskItemDto>> Create([FromBody] CreateTaskRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var created = await _service.CreateAsync(request.Descripcion, cancellationToken);
        return CreatedAtAction(nameof(GetAll), new { }, created);
    }

    /// <summary>Bulk-syncs task descriptions from the mobile client (union by description).</summary>
    [HttpPost("sync")]
    public async Task<ActionResult<SyncResultDto>> Sync([FromBody] SyncTasksRequest request, CancellationToken cancellationToken) =>
        Ok(await _service.SyncAsync(request.Descripciones ?? new List<string>(), cancellationToken));
}
