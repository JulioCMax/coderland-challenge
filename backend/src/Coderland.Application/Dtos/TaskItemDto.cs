namespace Coderland.Application.Dtos;

/// <summary>Read model returned by the API for a task.</summary>
/// <param name="Id">Unique identifier of the task.</param>
/// <param name="Descripcion" example="Buy groceries">Task description text.</param>
/// <param name="FechaCreacion">UTC timestamp of when the task was created.</param>
public record TaskItemDto(int Id, string Descripcion, DateTime FechaCreacion);
