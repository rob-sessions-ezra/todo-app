namespace Todo.Api.Tests.Controllers.Lists;

using System.Net.Http.Json;
using Todo.Api.Dtos;
using Todo.Api.Tests.Helpers;
using Xunit;

public partial class ListsControllerTests(ApiWebApplicationFactory factory) : IClassFixture<ApiWebApplicationFactory>, IAsyncLifetime
{
    private readonly HttpClient _client = factory.CreateClient();
    private readonly ApiWebApplicationFactory _factory = factory;

    public Task InitializeAsync() => _factory.ResetDatabaseAsync();

    public Task DisposeAsync() => Task.CompletedTask;

    protected async Task<TaskListDto> CreateTestList(string name = "Test List")
    {
        var response = await _client.PostAsJsonAsync("/api/lists", new CreateTaskListDto(name));
        response.EnsureSuccessStatusCode();
        var dto = await response.Content.ReadFromJsonAsync<TaskListDto>() ?? throw new InvalidOperationException("Failed to deserialize TaskListDto from response content.");
        return dto;
    }

    protected async Task<TaskItemDto> CreateTestTask(int listId, string title)
    {
        var requestDto = new CreateTaskDto(title, listId);
        var response = await _client.PostAsJsonAsync("/api/tasks", requestDto);
        response.EnsureSuccessStatusCode();
        var responseDto = await response.Content.ReadFromJsonAsync<TaskItemDto>() ?? throw new InvalidOperationException("Failed to deserialize TaskItemDto from response content.");
        return responseDto;
    }
}
