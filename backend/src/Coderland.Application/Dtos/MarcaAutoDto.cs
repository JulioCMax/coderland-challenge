namespace Coderland.Application.Dtos;

/// <summary>Read model returned by the API for a car brand.</summary>
/// <param name="Id">Unique identifier of the brand.</param>
/// <param name="Nombre" example="Toyota">Brand name.</param>
/// <param name="PaisOrigen" example="Japan">Country of origin, if known.</param>
/// <param name="FechaCreacion">UTC timestamp of when the brand record was created (seeded).</param>
public record MarcaAutoDto(int Id, string Nombre, string? PaisOrigen, DateTime FechaCreacion);
