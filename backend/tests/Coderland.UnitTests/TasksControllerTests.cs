using Coderland.Api.Controllers;
using Coderland.Application.Dtos;
using Coderland.Application.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Coderland.UnitTests;

public class TasksControllerTests
{
    [Fact]
    public async Task GetAll_Returns200WithTasks()
    {
        var service = new Mock<ITaskService>();
        service.Setup(s => s.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TaskItemDto> { new(1, "Wash car", DateTime.UtcNow) });
        var sut = new TasksController(service.Object);

        var result = await sut.GetAll(CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var payload = Assert.IsAssignableFrom<IReadOnlyList<TaskItemDto>>(ok.Value);
        Assert.Single(payload);
    }

    [Fact]
    public async Task Sync_Returns200WithResult()
    {
        var service = new Mock<ITaskService>();
        service.Setup(s => s.SyncAsync(It.IsAny<IEnumerable<string>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new SyncResultDto(2, 0, new List<TaskItemDto>()));
        var sut = new TasksController(service.Object);

        var result = await sut.Sync(new SyncTasksRequest(new List<string> { "a", "b" }), CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var payload = Assert.IsType<SyncResultDto>(ok.Value);
        Assert.Equal(2, payload.Imported);
    }
}
