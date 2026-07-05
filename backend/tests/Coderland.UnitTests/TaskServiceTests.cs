using Coderland.Application.Services;
using Coderland.Domain.Entities;
using Coderland.Domain.Repositories;
using Moq;

namespace Coderland.UnitTests;

public class TaskServiceTests
{
    [Fact]
    public async Task CreateAsync_RejectsEmptyDescription()
    {
        var repo = new Mock<ITaskRepository>();
        var sut = new TaskService(repo.Object);

        await Assert.ThrowsAsync<ArgumentException>(() => sut.CreateAsync("   "));
        repo.Verify(r => r.AddAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_PersistsAndReturnsDto()
    {
        var repo = new Mock<ITaskRepository>();
        repo.Setup(r => r.AddAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((TaskItem t, CancellationToken _) => { t.Id = 7; return t; });
        var sut = new TaskService(repo.Object);

        var dto = await sut.CreateAsync("Buy tires");

        Assert.Equal(7, dto.Id);
        Assert.Equal("Buy tires", dto.Descripcion);
    }

    [Fact]
    public async Task SyncAsync_SkipsDuplicatesCaseInsensitively()
    {
        var existing = new List<TaskItem> { new() { Id = 1, Descripcion = "Wash car" } };
        var repo = new Mock<ITaskRepository>();
        repo.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(existing);
        repo.Setup(r => r.AddRangeAsync(It.IsAny<IEnumerable<TaskItem>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((IEnumerable<TaskItem> items, CancellationToken _) =>
            {
                var list = items.ToList();
                for (var i = 0; i < list.Count; i++) list[i].Id = 100 + i;
                return list;
            });
        var sut = new TaskService(repo.Object);

        // "wash car" duplicates existing (case-insensitive); "Change oil" is new.
        var result = await sut.SyncAsync(new[] { "wash car", "Change oil" });

        Assert.Equal(1, result.Imported);
        Assert.Equal(1, result.Skipped);
        Assert.Equal(2, result.Tasks.Count); // existing + newly imported
    }

    [Fact]
    public async Task SyncAsync_CollapsesIntraBatchDuplicates()
    {
        var repo = new Mock<ITaskRepository>();
        repo.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(new List<TaskItem>());
        repo.Setup(r => r.AddRangeAsync(It.IsAny<IEnumerable<TaskItem>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((IEnumerable<TaskItem> items, CancellationToken _) =>
            {
                var list = items.ToList();
                for (var i = 0; i < list.Count; i++) list[i].Id = 100 + i;
                return list;
            });
        var sut = new TaskService(repo.Object);

        var result = await sut.SyncAsync(new[] { "Buy milk", "buy MILK" });

        Assert.Equal(1, result.Imported);
        Assert.Equal(1, result.Skipped);
        Assert.Single(result.Tasks);
    }

    [Fact]
    public async Task SyncAsync_CountsBlankEntriesAsSkipped()
    {
        var repo = new Mock<ITaskRepository>();
        repo.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(new List<TaskItem>());
        repo.Setup(r => r.AddRangeAsync(It.IsAny<IEnumerable<TaskItem>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((IEnumerable<TaskItem> items, CancellationToken _) =>
            {
                var list = items.ToList();
                for (var i = 0; i < list.Count; i++) list[i].Id = 200 + i;
                return list;
            });
        var sut = new TaskService(repo.Object);

        var result = await sut.SyncAsync(new[] { "  ", "Buy milk" });

        Assert.Equal(1, result.Imported);
        Assert.Equal(1, result.Skipped);
        Assert.Single(result.Tasks);
    }
}
