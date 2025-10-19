using System.Net;
using System.Net.Http.Json;
using Todo.Api.Dtos;
using Xunit;

namespace Todo.Api.Tests.Controllers.Lists;

public partial class ListsControllerTests
{
    [Fact]
    public async Task CreateList_ValidName_ReturnsCreated()
    {
        // Arrange
        var dto = new CreateTaskListDto("New List");
        
        // Act
        var response = await _client.PostAsJsonAsync("/api/lists", dto);
        var result = await response.Content.ReadFromJsonAsync<TaskListDto>();

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(result);
        Assert.Equal("New List", result.Name);
        Assert.Empty(result.TaskItems);
    }
}
