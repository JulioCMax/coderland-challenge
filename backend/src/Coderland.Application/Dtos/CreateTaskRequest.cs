namespace Coderland.Application.Dtos;

/// <summary>Request body to create a task. A blank description is rejected by the service (returns 400).</summary>
public record CreateTaskRequest(string Descripcion);
