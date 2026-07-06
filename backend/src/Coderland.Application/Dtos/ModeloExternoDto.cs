namespace Coderland.Application.Dtos;

/// <summary>External vehicle model returned live by the vPIC read-through catalog for a given brand. Not persisted locally.</summary>
/// <param name="Id">vPIC model identifier, as reported by the external source.</param>
/// <param name="Nombre" example="Corolla">Model name as reported by vPIC.</param>
/// <param name="Marca" example="Toyota">Brand this model belongs to (echoes the route parameter used to fetch it).</param>
public record ModeloExternoDto(int Id, string Nombre, string Marca);
