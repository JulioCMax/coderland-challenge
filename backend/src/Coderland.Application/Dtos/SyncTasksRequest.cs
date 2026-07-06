namespace Coderland.Application.Dtos;

/// <summary>Bulk push of task descriptions from the mobile client.</summary>
/// <param name="Descripciones">Task descriptions to sync. Blank entries are ignored; duplicates (case-insensitive, including matches against tasks that already exist) are skipped and reported in <see cref="SyncResultDto.Skipped"/>.</param>
public record SyncTasksRequest(List<string> Descripciones);
