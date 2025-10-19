namespace Todo.Api.Tests.Controllers.Lists;

using System.Net;
using System.Net.Http.Json;
using Todo.Api.Dtos;
using Xunit;

public partial class ListsControllerTests
{
    [Fact]
    public async Task GetLists_WhenEmpty_ReturnsEmptyArray()
    {
        // Act
        var response = await _client.GetAsync("/api/lists");
        var result = await response.Content.ReadFromJsonAsync<List<TaskListDto>>();

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task GetLists_WithData_ReturnsAllLists()
    {
        // Arrange
        var list1 = await CreateTestList("List 1");
        var list2 = await CreateTestList("List 2");

        // Act
        var response = await _client.GetAsync("/api/lists");
        var result = await response.Content.ReadFromJsonAsync<List<TaskListDto>>();

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
        Assert.Contains(result, l => l.Id == list1.Id);
        Assert.Contains(result, l => l.Id == list2.Id);
    }
}
