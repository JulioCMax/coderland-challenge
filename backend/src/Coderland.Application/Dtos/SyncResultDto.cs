namespace Coderland.Application.Dtos;

/// <summary>Outcome of a sync: how many were imported vs. skipped (already present), and the full list.</summary>
/// <param name="Imported">Number of new tasks that were persisted as a result of this sync.</param>
/// <param name="Skipped">Number of incoming descriptions skipped because they were blank, duplicated within the request, or already present (case-insensitive match against existing tasks).</param>
/// <param name="Tasks">Full, up-to-date task list after the sync (pre-existing tasks plus newly imported ones).</param>
public record SyncResultDto(int Imported, int Skipped, IReadOnlyList<TaskItemDto> Tasks);
