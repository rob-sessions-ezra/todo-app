using System.Net;
using System.Net.Http.Json;
using Todo.Api.Dtos;
using Xunit;

namespace Todo.Api.Tests.Controllers.Auth;

public partial class AuthControllerTests
{
    [Fact]
    public async Task Login_ValidCredentials_ReturnsOkWithToken()
    {
        // Arrange
        var email = NewEmail();
        await RegisterAsync(email);

        // Act
        var res = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest(email, "P@ssw0rd!"));
        var body = await res.Content.ReadFromJsonAsync<AuthResponse>();

        // Assert
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        Assert.NotNull(body);
        Assert.Equal(email, body.Email);
        Assert.False(string.IsNullOrWhiteSpace(body.Token));
    }

    [Fact]
    public async Task Login_InvalidCredentials_ReturnsUnauthorized()
    {
        // Arrange
        var email = NewEmail();
        await RegisterAsync(email);

        // Act
        var res = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest(email, "WrongPassword!"));

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }
}
