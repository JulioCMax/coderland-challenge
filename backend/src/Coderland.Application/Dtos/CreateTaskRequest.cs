namespace Coderland.Application.Dtos;

/// <summary>Request body to create a task. A blank description is rejected by the service (returns 400).</summary>
/// <param name="Descripcion" example="Buy groceries">Task description. Must not be empty or whitespace-only.</param>
public record CreateTaskRequest(string Descripcion);
