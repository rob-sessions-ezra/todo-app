using System.Net;
using System.Net.Http.Json;
using Todo.Api.Dtos;
using Xunit;

namespace Todo.Api.Tests.Controllers.Lists;

public partial class ListsControllerTests
{
    [Fact]
    public async Task ReorderTasks_WithValidIds_ReordersAndReturnsNoContent()
    {
        // Arrange
        var list = await CreateTestList("List for reorder");
        var t1 = await CreateTestTask(list.Id, "A");
        var t2 = await CreateTestTask(list.Id, "B");
        var t3 = await CreateTestTask(list.Id, "C");

        // Act
        var put = await _client.PutAsJsonAsync($"/api/lists/{list.Id}/reorder-tasks", new ReorderTasksDto([t3.Id, t2.Id, t1.Id]));

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, put.StatusCode);

        // Verify order (incomplete first, then by order)
        var get = await _client.GetAsync($"/api/tasks?listId={list.Id}");
        var items = await get.Content.ReadFromJsonAsync<List<TaskItemDto>>();
        Assert.NotNull(items);
        Assert.Equal(new[] { t3.Id, t2.Id, t1.Id }, items!.Where(i => !i.IsComplete).Select(i => i.Id).ToArray());
    }

    [Fact]
    public async Task ReorderTasks_ListNotFound_ReturnsNotFound()
    {
        // Act
        var resp = await _client.PutAsJsonAsync("/api/lists/9999/reorder-tasks", new ReorderTasksDto([1]));

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
    }

    [Fact]
    public async Task ReorderTasks_MissingTaskIds_ReturnsBadRequest()
    {
        // Arrange
        var list = await CreateTestList("Empty ids");

        // Act
        var resp = await _client.PutAsJsonAsync($"/api/lists/{list.Id}/reorder-tasks", new ReorderTasksDto([]));

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);
    }

    [Fact]
    public async Task ReorderTasks_NotPermutation_ReturnsBadRequest()
    {
        // Arrange
        var list = await CreateTestList("Bad permutation");
        var t1 = await CreateTestTask(list.Id, "A");
        var t2 = await CreateTestTask(list.Id, "B");
        var t3 = await CreateTestTask(list.Id, "C");

        // Missing one id (t2)
        var resp1 = await _client.PutAsJsonAsync($"/api/lists/{list.Id}/reorder-tasks", new ReorderTasksDto([t3.Id, t1.Id]));
        Assert.Equal(HttpStatusCode.BadRequest, resp1.StatusCode);

        // Contains an id from a different list
        var other = await CreateTestList("Other");
        var foreign = await CreateTestTask(other.Id, "X");
        var resp2 = await _client.PutAsJsonAsync($"/api/lists/{list.Id}/reorder-tasks", new ReorderTasksDto([t3.Id, t2.Id, foreign.Id]));
        Assert.Equal(HttpStatusCode.BadRequest, resp2.StatusCode);
    }

    [Fact]
    public async Task ReorderTasks_OnlyIncomplete_AcceptsAndKeepsCompletedUnchanged()
    {
        // Arrange
        var list = await CreateTestList("Mixed");
        var t1 = await CreateTestTask(list.Id, "A");
        var t2 = await CreateTestTask(list.Id, "B");
        var t3 = await CreateTestTask(list.Id, "C");

        // Mark one as complete
        var complResp = await _client.PatchAsJsonAsync($"/api/tasks/{t2.Id}/complete", new { isComplete = true });
        Assert.Equal(HttpStatusCode.NoContent, complResp.StatusCode);

        // Act: reorder only incomplete tasks [C, A]
        var resp = await _client.PutAsJsonAsync($"/api/lists/{list.Id}/reorder-tasks", new ReorderTasksDto([t3.Id, t1.Id]));

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, resp.StatusCode);

        // Verify: incomplete appear first in the new order, completed after
        var get = await _client.GetAsync($"/api/tasks?listId={list.Id}");
        var items = await get.Content.ReadFromJsonAsync<List<TaskItemDto>>();
        Assert.NotNull(items);

        var incompletes = items!.Where(i => !i.IsComplete).Select(i => i.Id).ToArray();
        var completes = items!.Where(i => i.IsComplete).Select(i => i.Id).ToArray();

        Assert.Equal(new[] { t3.Id, t1.Id }, incompletes);
        Assert.Contains(t2.Id, completes);
    }
}
