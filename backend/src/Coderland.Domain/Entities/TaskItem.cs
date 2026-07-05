namespace Coderland.Domain.Entities;

/// <summary>A user task (only a description), persisted in the <c>Tasks</c> table.</summary>
public class TaskItem
{
    public int Id { get; set; }

    /// <summary>Task description. Required.</summary>
    public string Descripcion { get; set; } = string.Empty;

    /// <summary>Creation timestamp (UTC).</summary>
    public DateTime FechaCreacion { get; set; }
}
