using System.Net;
using System.Net.Http.Json;
using Coderland.Application.Dtos;

namespace Coderland.IntegrationTests;

public class TasksEndpointTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public TasksEndpointTests(CustomWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task Post_Then_Get_ReturnsCreatedTask()
    {
        var client = _factory.CreateClient();

        var post = await client.PostAsJsonAsync("/api/tasks", new CreateTaskRequest("Rotate tires"));
        Assert.Equal(HttpStatusCode.Created, post.StatusCode);

        var list = await client.GetFromJsonAsync<List<TaskItemDto>>("/api/tasks");
        Assert.NotNull(list);
        Assert.Contains(list!, t => t.Descripcion == "Rotate tires");
    }

    [Fact]
    public async Task Post_EmptyDescription_ReturnsBadRequest()
    {
        var client = _factory.CreateClient();
        var post = await client.PostAsJsonAsync("/api/tasks", new CreateTaskRequest(""));
        Assert.Equal(HttpStatusCode.BadRequest, post.StatusCode);
    }
}
