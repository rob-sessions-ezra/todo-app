using System.Net;
using System.Net.Http.Json;
using Todo.Api.Dtos;
using Xunit;

namespace Todo.Api.Tests.Controllers.Lists;

public partial class ListsControllerTests
{
    [Fact]
    public async Task GetList_WhenExists_ReturnsList()
    {
        // Arrange
        var created = await CreateTestList("My List");

        // Act
        var response = await _client.GetAsync($"/api/lists/{created.Id}");
        var result = await response.Content.ReadFromJsonAsync<TaskListDto>();

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(result);
        Assert.Equal(created.Id, result.Id);
        Assert.Equal("My List", result.Name);
    }

    [Fact]
    public async Task GetList_WhenNotExists_ReturnsNotFound()
    {
        // Act
        var response = await _client.GetAsync("/api/lists/9999");
        
        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
