namespace Coderland.Application.Dtos;

/// <summary>External car brand (make) returned live by the vPIC read-through catalog. Not persisted locally.</summary>
/// <param name="Id">vPIC make identifier, as reported by the external source.</param>
/// <param name="Nombre" example="TOYOTA">Brand name as reported by vPIC (typically upper-case).</param>
public record MarcaExternaDto(int Id, string Nombre);
