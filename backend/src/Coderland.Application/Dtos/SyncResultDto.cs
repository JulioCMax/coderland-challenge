namespace Coderland.Application.Dtos;

/// <summary>Outcome of a sync: how many were imported vs. skipped (already present), and the full list.</summary>
public record SyncResultDto(int Imported, int Skipped, IReadOnlyList<TaskItemDto> Tasks);
