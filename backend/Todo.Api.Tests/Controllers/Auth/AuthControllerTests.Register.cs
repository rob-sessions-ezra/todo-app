using System.Net;
using System.Net.Http.Json;
using Todo.Api.Dtos;
using Xunit;

namespace Todo.Api.Tests.Controllers.Auth;

public partial class AuthControllerTests
{
    [Fact]
    public async Task Register_NewEmail_ReturnsOkWithToken()
    {
        // Arrange
        var email = NewEmail();

        // Act
        var res = await _client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, "P@ssw0rd!"));
        var body = await res.Content.ReadFromJsonAsync<AuthResponse>();

        // Assert
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        Assert.NotNull(body);
        Assert.Equal(email, body.Email);
        Assert.NotEqual(Guid.Empty, body.UserId);
        Assert.False(string.IsNullOrWhiteSpace(body.Token));
    }

    [Fact]
    public async Task Register_DuplicateEmail_ReturnsConflict()
    {
        // Arrange
        var email = NewEmail();
        await RegisterAsync(email);

        // Act
        var res = await _client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, "P@ssw0rd!"));

        // Assert
        Assert.Equal(HttpStatusCode.Conflict, res.StatusCode);
    }

    [Fact]
    public async Task Register_AdoptsGuestData_GuestListsRemainVisibleAfterAuth()
    {
        // Arrange - As guest, create a list
        var createListRes = await _client.PostAsJsonAsync("/api/lists", new CreateTaskListDto("Guest List"));
        createListRes.EnsureSuccessStatusCode();
        var guestList = await createListRes.Content.ReadFromJsonAsync<TaskListDto>() ?? throw new InvalidOperationException();

        // Act - Register
        var email = NewEmail();
        var auth = await RegisterAsync(email);
        UseBearer(auth.Token);

        // Fetch lists under JWT
        var listsRes = await _client.GetAsync("/api/lists");
        listsRes.EnsureSuccessStatusCode();
        var lists = await listsRes.Content.ReadFromJsonAsync<List<TaskListDto>>() ?? [];
        
        // Assert — should include the guest-created list
        Assert.Contains(lists, l => l.Id == guestList.Id && l.Name == "Guest List");
    }
}
