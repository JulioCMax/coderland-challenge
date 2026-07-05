namespace MarcasAutos.Application.Dtos;

/// <summary>Read model returned by the API for a car brand.</summary>
public record MarcaAutoDto(int Id, string Nombre, string? PaisOrigen, DateTime FechaCreacion);
