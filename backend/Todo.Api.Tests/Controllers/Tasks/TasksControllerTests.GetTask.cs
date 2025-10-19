using System.Net;
using System.Net.Http.Json;
using Todo.Api.Dtos;
using Xunit;

namespace Todo.Api.Tests.Controllers.Tasks;

public partial class TasksControllerTests
{
    [Fact]
    public async Task GetTask_WhenExists_ReturnsTask()
    {
        // Arrange
        var created = await CreateTestTask("My Task");

        // Act
        var response = await _client.GetAsync($"/api/tasks/{created.Id}");
        var result = await response.Content.ReadFromJsonAsync<TaskItemDto>();

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(result);
        Assert.Equal(created.Id, result.Id);
        Assert.Equal("My Task", result.Title);
    }

    [Fact]
    public async Task GetTask_WhenNotExists_ReturnsNotFound()
    {
        // Act
        var response = await _client.GetAsync("/api/tasks/9999");
        
        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
