using System.ComponentModel.DataAnnotations;

namespace Coderland.Application.Dtos;

/// <summary>Request body to create a task. Description must not be empty.</summary>
public record CreateTaskRequest([Required, MinLength(1)] string Descripcion);
