using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Todo.Api.Data;

namespace Todo.Api.Middleware;

public class SetCurrentUserMiddleware(RequestDelegate next)
{
    public const string GuestCookieName = "todo.guest_id";

    public async Task InvokeAsync(HttpContext context, TaskContext db)
    {
        if (TryGetSubGuid(context.User, out var userId))
        {
            db.CurrentUserId = userId;
            await next(context);
            return;
        }

        var guestId = EnsureGuestIdCookie(context);
        db.CurrentUserId = guestId;

        await next(context);
    }

    private static bool TryGetSubGuid(ClaimsPrincipal user, out Guid id)
    {
        var sub = user.FindFirstValue(JwtRegisteredClaimNames.Sub);
        return Guid.TryParse(sub, out id);
    }

    private static Guid EnsureGuestIdCookie(HttpContext ctx)
    {
        if (ctx.Request.Cookies.TryGetValue(GuestCookieName, out var val) && Guid.TryParse(val, out var existing))
        {
            return existing;
        }

        var fresh = Guid.NewGuid();
        ctx.Response.Cookies.Append(GuestCookieName, fresh.ToString(), CookieOpts(ctx));
        return fresh;
    }

    private static CookieOptions CookieOpts(HttpContext ctx)
    {
        var isHttps = ctx.Request.IsHttps;
        return new CookieOptions
        {
            HttpOnly = true,
            IsEssential = true,
            Secure = isHttps, // required if SameSite=None
            SameSite = isHttps ? SameSiteMode.None : SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddDays(30) // allow cookies to persist even on browser restart
        };
    }
}
