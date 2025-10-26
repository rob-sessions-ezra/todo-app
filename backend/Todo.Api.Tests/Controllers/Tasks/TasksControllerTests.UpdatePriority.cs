using System.Net;
using System.Net.Http.Json;
using Todo.Api.Dtos;
using Todo.Api.Entities;
using Xunit;

namespace Todo.Api.Tests.Controllers.Tasks;

public partial class TasksControllerTests
{
    [Fact]
    public async Task UpdatePriority_TogglesBetweenNormalAndFire()
    {
        // Arrange
        var list = await CreateTestList("My List");
        var created = await CreateTestTask("Task", list.Id);

        // Set to Fire
        var fireResp = await _client.PatchAsJsonAsync($"/api/tasks/{created.Id}/priority", new { priority = PriorityLevel.Fire });
        Assert.Equal(HttpStatusCode.NoContent, fireResp.StatusCode);

        // Assert Fire
        var getFire = await _client.GetAsync($"/api/tasks/{created.Id}");
        var afterFire = await getFire.Content.ReadFromJsonAsync<TaskItemDto>();
        Assert.NotNull(afterFire);
        Assert.Equal(PriorityLevel.Fire, afterFire.Priority);

        // Set back to Normal
        var normalResp = await _client.PatchAsJsonAsync($"/api/tasks/{created.Id}/priority", new { priority = PriorityLevel.Normal });
        Assert.Equal(HttpStatusCode.NoContent, normalResp.StatusCode);

        // Assert Normal
        var getNormal = await _client.GetAsync($"/api/tasks/{created.Id}");
        var afterNormal = await getNormal.Content.ReadFromJsonAsync<TaskItemDto>();
        Assert.NotNull(afterNormal);
        Assert.Equal(PriorityLevel.Normal, afterNormal.Priority);
    }

    [Fact]
    public async Task UpdatePriority_NotFound_ReturnsNotFound()
    {
        // Act
        var resp = await _client.PatchAsJsonAsync("/api/tasks/9999/priority", new { priority = PriorityLevel.Fire });

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
    }
}
