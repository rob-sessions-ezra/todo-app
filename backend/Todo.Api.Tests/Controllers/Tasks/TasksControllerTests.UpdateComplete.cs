using System.Net;
using System.Net.Http.Json;
using Todo.Api.Dtos;
using Xunit;

namespace Todo.Api.Tests.Controllers.Tasks;

public partial class TasksControllerTests
{
    [Fact]
    public async Task UpdateComplete_UpdatesCompletion()
    {
        // Arrange
        var list = await CreateTestList("My List");
        var created = await CreateTestTask("Task", list.Id);

        // Act
        var resp = await _client.PatchAsJsonAsync($"/api/tasks/{created.Id}/complete", new { isComplete = true });

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, resp.StatusCode);

        // Verify
        var getResponse = await _client.GetAsync($"/api/tasks/{created.Id}");
        var updated = await getResponse.Content.ReadFromJsonAsync<TaskItemDto>();
        Assert.NotNull(updated);
        Assert.True(updated.IsComplete);
    }

    [Fact]
    public async Task UpdateComplete_NotFound_ReturnsNotFound()
    {
        // Act
        var resp = await _client.PatchAsJsonAsync("/api/tasks/9999/complete", new { isComplete = true });

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
    }
}
