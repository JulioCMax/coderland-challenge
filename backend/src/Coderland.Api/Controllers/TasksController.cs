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
    /// <remarks>Returns the full task list as currently persisted; there is no pagination or filtering.</remarks>
    /// <param name="cancellationToken">Propagated to the underlying database query.</param>
    /// <response code="200">The full list of tasks, possibly empty.</response>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<TaskItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<TaskItemDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await _service.GetAllAsync(cancellationToken));

    /// <summary>Creates a single task. Rejects an empty or blank description.</summary>
    /// <remarks>
    /// The description is trimmed before being persisted. An empty or whitespace-only description is
    /// rejected with a validation problem rather than being silently accepted or auto-corrected.
    /// </remarks>
    /// <param name="request">The task to create.</param>
    /// <param name="cancellationToken">Propagated to the underlying database write.</param>
    /// <response code="201">The created task, including its assigned id and creation timestamp.</response>
    /// <response code="400">The description was empty or whitespace-only.</response>
    [HttpPost]
    [ProducesResponseType(typeof(TaskItemDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TaskItemDto>> Create([FromBody] CreateTaskRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await _service.CreateAsync(request.Descripcion, cancellationToken);
            return CreatedAtAction(nameof(GetAll), new { }, created);
        }
        catch (ArgumentException ex)
        {
            ModelState.AddModelError(nameof(CreateTaskRequest.Descripcion), ex.Message);
            return ValidationProblem(ModelState);
        }
    }

    /// <summary>Bulk-syncs task descriptions from the mobile client (union by description).</summary>
    /// <remarks>
    /// Intended for the mobile client to reconcile its local (possibly offline-created) tasks with the
    /// server. Descriptions are compared case-insensitively; blanks are ignored and anything already present
    /// (either in the request or already persisted) is skipped rather than duplicated. The response reports
    /// how many were imported vs. skipped, plus the resulting full task list.
    /// </remarks>
    /// <param name="request">The task descriptions to sync.</param>
    /// <param name="cancellationToken">Propagated to the underlying database reads/writes.</param>
    /// <response code="200">The sync outcome: counts of imported/skipped tasks plus the full, up-to-date task list.</response>
    [HttpPost("sync")]
    [ProducesResponseType(typeof(SyncResultDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SyncResultDto>> Sync([FromBody] SyncTasksRequest request, CancellationToken cancellationToken) =>
        Ok(await _service.SyncAsync(request.Descripciones ?? new List<string>(), cancellationToken));
}
