using System.Net;
using Xunit;

namespace Todo.Api.Tests.Controllers.Auth;

public partial class AuthControllerTests
{
    [Fact]
    public async Task Logout_DeletesGuestCookie_ReturnsNoContent()
    {
        // Arrange
        var email = NewEmail();
        await RegisterAsync(email);
        await LoginAsync(email);

        // Act
        var res = await _client.PostAsync("/api/auth/logout", content: null);

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, res.StatusCode);
        Assert.True(res.Headers.TryGetValues("Set-Cookie", out var setCookies), "should include Set-Cookie instruction that deletes the guest cookie");
        Assert.Contains(setCookies, v => v.Contains("todo.guest_id="));
    }
}
