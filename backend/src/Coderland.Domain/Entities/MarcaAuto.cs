namespace Coderland.Domain.Entities;

/// <summary>Car brand aggregate root persisted in the <c>MarcasAutos</c> table.</summary>
public class MarcaAuto
{
    public int Id { get; set; }

    /// <summary>Brand name. Required and unique.</summary>
    public string Nombre { get; set; } = string.Empty;

    /// <summary>Optional country of origin.</summary>
    public string? PaisOrigen { get; set; }

    /// <summary>Creation timestamp (UTC).</summary>
    public DateTime FechaCreacion { get; set; }
}
