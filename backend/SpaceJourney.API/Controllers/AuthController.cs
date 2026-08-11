using MediatR;
using Microsoft.AspNetCore.Mvc;
using SpaceJourney.API.Features.Auth;

namespace SpaceJourney.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>POST /api/auth/login — Admin đăng nhập, nhận JWT</summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _mediator.Send(new LoginCommand(request.Username, request.Password));
        if (result is null)
            return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng." });

        return Ok(new { token = result });
    }
}

public record LoginRequest(string Username, string Password);
