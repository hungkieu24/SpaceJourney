using MediatR;
using SpaceJourney.API.Models;
using SpaceJourney.API.Repositories;
using SpaceJourney.API.Services;

namespace SpaceJourney.API.Features.Photos;

// ─── Get Photos ───────────────────────────────────────────────────────────────
public record GetPhotosQuery(string? SceneId, bool AdminView) : IRequest<List<Astronaut>>;

public class GetPhotosQueryHandler : IRequestHandler<GetPhotosQuery, List<Astronaut>>
{
    private readonly AstronautRepository _repo;

    public GetPhotosQueryHandler(AstronautRepository repo) => _repo = repo;

    public async Task<List<Astronaut>> Handle(GetPhotosQuery request, CancellationToken cancellationToken)
    {
        if (!string.IsNullOrEmpty(request.SceneId))
            return request.AdminView
                ? await _repo.GetAllBySceneIdAsync(request.SceneId)
                : await _repo.GetBySceneIdAsync(request.SceneId);

        return request.AdminView ? await _repo.GetAllAdminAsync() : await _repo.GetAllVisibleAsync();
    }
}

// ─── Upload Photo ─────────────────────────────────────────────────────────────
public record UploadPhotoCommand(IFormFile File, string? Name, string? Description, string? SceneId) : IRequest<Astronaut>;

public class UploadPhotoCommandHandler : IRequestHandler<UploadPhotoCommand, Astronaut>
{
    private readonly AstronautRepository _repo;
    private readonly CloudinaryService _cloudinary;

    public UploadPhotoCommandHandler(AstronautRepository repo, CloudinaryService cloudinary)
    {
        _repo = repo;
        _cloudinary = cloudinary;
    }

    public async Task<Astronaut> Handle(UploadPhotoCommand request, CancellationToken cancellationToken)
    {
        string hash;
        using (var md5 = System.Security.Cryptography.MD5.Create())
        using (var stream = request.File.OpenReadStream())
        {
            var hashBytes = await md5.ComputeHashAsync(stream, cancellationToken);
            hash = Convert.ToHexString(hashBytes);
        }

        var existing = await _repo.GetByHashAsync(hash);
        if (existing != null)
        {
            if (!string.IsNullOrEmpty(existing.CloudinaryPublicId))
            {
                await _cloudinary.DeleteAsync(existing.CloudinaryPublicId);
            }
            await _repo.DeleteAsync(existing.Id);
        }

        var (url, publicId) = await _cloudinary.UploadAsync(request.File);

        // Order = cuối cùng trong cảnh
        var existingInScene = await _repo.GetAllBySceneIdAsync(request.SceneId);
        var nextOrder = existingInScene.Count;

        var astronaut = new Astronaut
        {
            Name = request.Name ?? "",
            Description = request.Description ?? "",
            CloudinaryUrl = url,
            CloudinaryPublicId = publicId,
            SceneId = string.IsNullOrEmpty(request.SceneId) ? null : request.SceneId,
            FileHash = hash,
            Order = nextOrder,
            IsVisible = true
        };

        await _repo.InsertAsync(astronaut);
        return astronaut;
    }
}

// ─── Update Photo ─────────────────────────────────────────────────────────────
public record UpdatePhotoCommand(string Id, string? Name, string? Description, string? SceneId, int? Order, bool? IsVisible) : IRequest;

public class UpdatePhotoCommandHandler : IRequestHandler<UpdatePhotoCommand>
{
    private readonly AstronautRepository _repo;

    public UpdatePhotoCommandHandler(AstronautRepository repo) => _repo = repo;

    public async Task Handle(UpdatePhotoCommand request, CancellationToken cancellationToken)
    {
        var astronaut = await _repo.GetByIdAsync(request.Id);
        if (astronaut is null) return;

        if (request.Name is not null) astronaut.Name = request.Name;
        if (request.Description is not null) astronaut.Description = request.Description;
        if (request.SceneId != null) astronaut.SceneId = request.SceneId == "" ? null : request.SceneId;
        if (request.Order.HasValue) astronaut.Order = request.Order.Value;
        if (request.IsVisible.HasValue) astronaut.IsVisible = request.IsVisible.Value;

        await _repo.UpdateAsync(astronaut);
    }
}

// ─── Delete Photo ─────────────────────────────────────────────────────────────
public record DeletePhotoCommand(string Id) : IRequest;

public class DeletePhotoCommandHandler : IRequestHandler<DeletePhotoCommand>
{
    private readonly AstronautRepository _repo;
    private readonly CloudinaryService _cloudinary;

    public DeletePhotoCommandHandler(AstronautRepository repo, CloudinaryService cloudinary)
    {
        _repo = repo;
        _cloudinary = cloudinary;
    }

    public async Task Handle(DeletePhotoCommand request, CancellationToken cancellationToken)
    {
        var astronaut = await _repo.GetByIdAsync(request.Id);
        if (astronaut is null) return;

        // Xóa khỏi Cloudinary trước
        if (!string.IsNullOrEmpty(astronaut.CloudinaryPublicId))
            await _cloudinary.DeleteAsync(astronaut.CloudinaryPublicId);

        await _repo.DeleteAsync(request.Id);
    }
}
