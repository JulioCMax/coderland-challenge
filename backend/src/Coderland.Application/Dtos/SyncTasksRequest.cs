namespace Coderland.Application.Dtos;

/// <summary>Bulk push of task descriptions from the mobile client.</summary>
public record SyncTasksRequest(List<string> Descripciones);
