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

    [Fact]
    public async Task Post_WhitespaceDescription_ReturnsBadRequest()
    {
        var client = _factory.CreateClient();
        var post = await client.PostAsJsonAsync("/api/tasks", new CreateTaskRequest("   "));
        Assert.Equal(HttpStatusCode.BadRequest, post.StatusCode);
    }

    [Fact]
    public async Task Sync_DedupsAndReturnsReconciledCounts()
    {
        var client = _factory.CreateClient();
        var request = new SyncTasksRequest(new List<string> { "Sync-Alpha", "Sync-Beta", "sync-alpha" });
        var response = await client.PostAsJsonAsync("/api/tasks/sync", request);
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<SyncResultDto>();
        Assert.NotNull(result);
        Assert.Equal(2, result!.Imported);   // Sync-Alpha, Sync-Beta
        Assert.Equal(1, result.Skipped);     // "sync-alpha" duplicates "Sync-Alpha" (case-insensitive)
    }
}
