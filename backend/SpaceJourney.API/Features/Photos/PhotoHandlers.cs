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

        return await _repo.GetAllVisibleAsync();
    }
}

// ─── Upload Photo ─────────────────────────────────────────────────────────────
public record UploadPhotoCommand(IFormFile File, string Name, string Description, string SceneId) : IRequest<Astronaut>;

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
        var (url, publicId) = await _cloudinary.UploadAsync(request.File);

        // Order = cuối cùng trong cảnh
        var existingInScene = await _repo.GetAllBySceneIdAsync(request.SceneId);
        var nextOrder = existingInScene.Count;

        var astronaut = new Astronaut
        {
            Name = request.Name,
            Description = request.Description,
            CloudinaryUrl = url,
            CloudinaryPublicId = publicId,
            SceneId = request.SceneId,
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
        if (request.SceneId is not null) astronaut.SceneId = request.SceneId;
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
