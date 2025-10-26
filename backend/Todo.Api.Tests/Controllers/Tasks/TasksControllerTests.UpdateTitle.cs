using System.Net;
using System.Net.Http.Json;
using Todo.Api.Dtos;
using Xunit;

namespace Todo.Api.Tests.Controllers.Tasks;

public partial class TasksControllerTests
{
    [Fact]
    public async Task UpdateTitle_UpdatesTaskTitle()
    {
        // Arrange
        var list = await CreateTestList("My List");
        var created = await CreateTestTask("Old Title", list.Id);

        // Act
        var resp = await _client.PatchAsJsonAsync($"/api/tasks/{created.Id}/title", new { title = "New Title" });

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, resp.StatusCode);

        // Verify
        var getResponse = await _client.GetAsync($"/api/tasks/{created.Id}");
        var updated = await getResponse.Content.ReadFromJsonAsync<TaskItemDto>();
        Assert.NotNull(updated);
        Assert.Equal("New Title", updated!.Title);
    }

    [Fact]
    public async Task UpdateTitle_NotFound_ReturnsNotFound()
    {
        // Act
        var resp = await _client.PatchAsJsonAsync("/api/tasks/9999/title", new { title = "X" });

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
    }
}
