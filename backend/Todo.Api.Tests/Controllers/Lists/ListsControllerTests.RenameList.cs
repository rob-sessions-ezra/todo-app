using System.Net;
using System.Net.Http.Json;
using Todo.Api.Dtos;
using Xunit;

namespace Todo.Api.Tests.Controllers.Lists;

public partial class ListsControllerTests
{
    [Fact]
    public async Task RenameList_ValidName_UpdatesName()
    {
        // Arrange
        var created = await CreateTestList("Old Name");
        var dto = new RenameTaskListDto("New Name");

        // Act
        var response = await _client.PatchAsJsonAsync($"/api/lists/{created.Id}/title", dto);
        var result = await response.Content.ReadFromJsonAsync<TaskListDto>();

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(result);
        Assert.Equal("New Name", result.Name);
    }

    [Fact]
    public async Task RenameList_EmptyName_ReturnsBadRequest()
    {
        // Arrange
        var created = await CreateTestList("Old Name");
        var dto = new RenameTaskListDto("");

        // Act
        var response = await _client.PatchAsJsonAsync($"/api/lists/{created.Id}/title", dto);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task RenameList_NotFound_ReturnsNotFound()
    {
        // Arrange
        var dto = new RenameTaskListDto("Name");

        // Act
        var response = await _client.PatchAsJsonAsync("/api/lists/9999/title", dto);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
