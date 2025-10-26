using System.Net;
using System.Net.Http.Json;
using Todo.Api.Dtos;
using Xunit;

namespace Todo.Api.Tests.Controllers.Tasks;

public partial class TasksControllerTests
{
    [Fact]
    public async Task CreateTask_WithList_ReturnsCreated()
    {
        // Arrange
        var list = await CreateTestList("Test List");
        var dto = new CreateTaskDto("New Task", list.Id);

        // Act
        var response = await _client.PostAsJsonAsync("/api/tasks", dto);
        var result = await response.Content.ReadFromJsonAsync<TaskItemDto>();

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(result);
        Assert.Equal("New Task", result.Title);
        Assert.Equal(list.Id, result.TaskListId);
    }

    [Fact]
    public async Task CreateTask_WithInvalidListId_ReturnsBadRequest()
    {
        // Arrange
        var dto = new CreateTaskDto("New Task", 9999);

        // Act
        var response = await _client.PostAsJsonAsync("/api/tasks", dto);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
