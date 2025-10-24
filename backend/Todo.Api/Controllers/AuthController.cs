using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Todo.Api.Data;
using Todo.Api.Dtos;
using Todo.Api.Entities;
using Todo.Api.Middleware;
using Todo.Api.Services;

namespace Todo.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    TaskContext db,
    IPasswordHasher hasher,
    IJwtTokenService tokens) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest req)
    {
        var email = req.Email.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(req.Password))
        {
            return BadRequest(new { message = "Email and password are required." });
        }

        var exists = await db.Set<User>().AnyAsync(u => u.Email == email);
        if (exists)
        {
            return Conflict(new { message = "Email already registered." });
        }

        var (hash, salt) = hasher.Hash(req.Password);
        var user = new User
        {
            Id = db.CurrentUserId, // adopt current user id so guest data stays with the user
            Email = email,
            PasswordHash = hash,
            PasswordSalt = salt
        };
        
        db.Add(user);
        await db.SaveChangesAsync();

        var token = tokens.CreateToken(user.Id, user.Email);
        return Ok(new AuthResponse(user.Id, user.Email, token));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest req)
    {
        var email = req.Email.Trim().ToLowerInvariant();
        var user = await db.Set<User>().FirstOrDefaultAsync(u => u.Email == email);
        if (user is null)
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        if (!hasher.Verify(req.Password, user.PasswordHash, user.PasswordSalt))
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        var token = tokens.CreateToken(user.Id, user.Email);
        return Ok(new AuthResponse(user.Id, user.Email, token));
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        // Remove the guest cookie so a new guest id is issued next request
        Response.Cookies.Delete(SetCurrentUserMiddleware.GuestCookieName);
        return NoContent();
    }
}
