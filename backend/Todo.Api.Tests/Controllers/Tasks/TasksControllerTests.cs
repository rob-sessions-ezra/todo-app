using System.Net.Http.Json;
using Todo.Api.Dtos;
using Todo.Api.Tests.Helpers;
using Xunit;

namespace Todo.Api.Tests.Controllers.Tasks;

public partial class TasksControllerTests(ApiWebApplicationFactory factory) : IClassFixture<ApiWebApplicationFactory>, IAsyncLifetime
{
    private readonly HttpClient _client = factory.CreateClient();
    private readonly ApiWebApplicationFactory _factory = factory;

    public Task InitializeAsync() => _factory.ResetDatabaseAsync();

    public Task DisposeAsync() => Task.CompletedTask;

    // Helper methods
    protected async Task<TaskListDto> CreateTestList(string name = "Test List")
    {
        var response = await _client.PostAsJsonAsync("/api/lists", new CreateTaskListDto(name));
        var dto = await response.Content.ReadFromJsonAsync<TaskListDto>() ?? throw new InvalidOperationException("Failed to deserialize TaskListDto from response content.");
        return dto;
    }

    protected async Task<TaskItemDto> CreateTestTask(string title = "Test Task", int? listId = null)
    {
        if (listId == null)
        {
            var list = await CreateTestList("Default List");
            listId = list.Id;
        }
        
        var response = await _client.PostAsJsonAsync("/api/tasks", new CreateTaskDto(title, false, null, listId));
        var dto = await response.Content.ReadFromJsonAsync<TaskItemDto>() ?? throw new InvalidOperationException("Failed to deserialize TaskItemDto from response content.");
        return dto;
    }
}
