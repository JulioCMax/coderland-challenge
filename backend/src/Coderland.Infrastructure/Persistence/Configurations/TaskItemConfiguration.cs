using Coderland.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Coderland.Infrastructure.Persistence.Configurations;

public class TaskItemConfiguration : IEntityTypeConfiguration<TaskItem>
{
    private const int MaxDescriptionLength = 500;

    public void Configure(EntityTypeBuilder<TaskItem> builder)
    {
        builder.ToTable("Tasks");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Descripcion).IsRequired().HasMaxLength(MaxDescriptionLength);
        builder.Property(t => t.FechaCreacion).IsRequired();
    }
}
