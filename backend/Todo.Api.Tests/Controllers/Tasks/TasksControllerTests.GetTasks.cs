using System.Net;
using System.Net.Http.Json;
using Todo.Api.Dtos;
using Xunit;

namespace Todo.Api.Tests.Controllers.Tasks;

public partial class TasksControllerTests
{
    [Fact]
    public async Task GetTasks_WhenEmpty_ReturnsEmptyArray()
    {
        // Act
        var response = await _client.GetAsync("/api/tasks");
        var result = await response.Content.ReadFromJsonAsync<List<TaskItemDto>>();

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task GetTasks_WithoutListId_ReturnsAllTasks()
    {
        // Arrange
        var list = await CreateTestList("My List");
        var task1 = await CreateTestTask("First Task", list.Id);
        var task2 = await CreateTestTask("Second Task", list.Id);

        // Act
        var response = await _client.GetAsync("/api/tasks");
        var result = await response.Content.ReadFromJsonAsync<List<TaskItemDto>>();

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task GetTasks_WithInvalidListId_ReturnsNotFound()
    {
        // Act
        var response = await _client.GetAsync("/api/tasks?listId=9999");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
