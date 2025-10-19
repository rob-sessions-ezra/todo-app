using System.Net;
using System.Net.Http.Json;
using Todo.Api.Dtos;
using Xunit;

namespace Todo.Api.Tests.Controllers.Tasks;

public partial class TasksControllerTests
{
    [Fact]
    public async Task UpdateTask_ValidData_UpdatesTask()
    {
        // Arrange
        var list = await CreateTestList("My List");
        var created = await CreateTestTask("Old Title", list.Id);
        var dto = new UpdateTaskDto("New Title", true, null, list.Id);

        // Act
        var response = await _client.PutAsJsonAsync($"/api/tasks/{created.Id}", dto);

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        // Verify update
        var getResponse = await _client.GetAsync($"/api/tasks/{created.Id}");
        var updated = await getResponse.Content.ReadFromJsonAsync<TaskItemDto>();

        Assert.NotNull(updated);
        Assert.Equal("New Title", updated.Title);
        Assert.True(updated.IsComplete);
    }

    [Fact]
    public async Task UpdateTask_WithValidListId_UpdatesTask()
    {
        // Arrange
        var list = await CreateTestList("My List");
        var created = await CreateTestTask("Task");
        var dto = new UpdateTaskDto("Task", false, null, list.Id);

        // Act
        var response = await _client.PutAsJsonAsync($"/api/tasks/{created.Id}", dto);

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task UpdateTask_WithInvalidListId_ReturnsBadRequest()
    {
        // Arrange
        var created = await CreateTestTask("Task");
        var dto = new UpdateTaskDto("Task", false, null, 9999);

        // Act
        var response = await _client.PutAsJsonAsync($"/api/tasks/{created.Id}", dto);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdateTask_NotFound_ReturnsNotFound()
    {
        // Arrange
        var dto = new UpdateTaskDto("Task", false, null, null);

        // Act
        var response = await _client.PutAsJsonAsync("/api/tasks/9999", dto);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
