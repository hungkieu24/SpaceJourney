using MediatR;
using SpaceJourney.API.Repositories;
using SpaceJourney.API.Services;

namespace SpaceJourney.API.Features.Auth;

public record LoginCommand(string Username, string Password) : IRequest<string?>;

public class LoginCommandHandler : IRequestHandler<LoginCommand, string?>
{
    private readonly AdminUserRepository _userRepo;
    private readonly JwtService _jwtService;

    public LoginCommandHandler(AdminUserRepository userRepo, JwtService jwtService)
    {
        _userRepo = userRepo;
        _jwtService = jwtService;
    }

    public async Task<string?> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepo.GetByUsernameAsync(request.Username);
        if (user is null) return null;

        var isValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!isValid) return null;

        return _jwtService.GenerateToken(user.Id, user.Username);
    }
}
