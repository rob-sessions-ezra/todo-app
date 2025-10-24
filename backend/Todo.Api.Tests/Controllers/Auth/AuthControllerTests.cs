using System.Net.Http.Headers;
using System.Net.Http.Json;
using Todo.Api.Dtos;
using Todo.Api.Tests.Helpers;
using Xunit;

namespace Todo.Api.Tests.Controllers.Auth;

public partial class AuthControllerTests(ApiWebApplicationFactory factory) : IClassFixture<ApiWebApplicationFactory>, IAsyncLifetime
{
    private readonly HttpClient _client = factory.CreateClient();

    public Task InitializeAsync() => factory.ResetDatabaseAsync();
    public Task DisposeAsync() => Task.CompletedTask;

    private static string NewEmail() => $"user_{Guid.NewGuid():N}@example.com";

    private async Task<AuthResponse> RegisterAsync(string email, string password = "P@ssw0rd!")
    {
        var res = await _client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, password));
        res.EnsureSuccessStatusCode();
        return await res.Content.ReadFromJsonAsync<AuthResponse>() ?? throw new InvalidOperationException("No AuthResponse");
    }

    private async Task<AuthResponse> LoginAsync(string email, string password = "P@ssw0rd!")
    {
        var res = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest(email, password));
        res.EnsureSuccessStatusCode();
        return await res.Content.ReadFromJsonAsync<AuthResponse>() ?? throw new InvalidOperationException("No AuthResponse");
    }

    private void UseBearer(string token)
    {
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }
}
