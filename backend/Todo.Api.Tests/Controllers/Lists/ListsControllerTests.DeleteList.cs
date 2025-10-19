using System.Net;
using Xunit;

namespace Todo.Api.Tests.Controllers.Lists;

public partial class ListsControllerTests
{
    [Fact]
    public async Task DeleteList_WhenExists_DeletesAndReturnsNoContent()
    {
        // Arrange
        var created = await CreateTestList("To Delete");

        // Act
        var response = await _client.DeleteAsync($"/api/lists/{created.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        // Confirm it's gone
        var getResponse = await _client.GetAsync($"/api/lists/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    [Fact]
    public async Task DeleteList_WhenNotExists_ReturnsNotFound()
    {
        // Act
        var response = await _client.DeleteAsync("/api/lists/9999");
        
        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
