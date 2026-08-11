using MediatR;
using SpaceJourney.API.Models;
using SpaceJourney.API.Repositories;

namespace SpaceJourney.API.Features.Scenes;

// ─── Get Scenes ───────────────────────────────────────────────────────────────
public record GetScenesQuery(bool AdminView) : IRequest<List<Scene>>;

public class GetScenesQueryHandler : IRequestHandler<GetScenesQuery, List<Scene>>
{
    private readonly SceneRepository _sceneRepo;

    public GetScenesQueryHandler(SceneRepository sceneRepo)
    {
        _sceneRepo = sceneRepo;
    }

    public async Task<List<Scene>> Handle(GetScenesQuery request, CancellationToken cancellationToken) =>
        request.AdminView
            ? await _sceneRepo.GetAllAsync()
            : await _sceneRepo.GetVisibleAsync();
}

// ─── Reorder Scenes ───────────────────────────────────────────────────────────
public record ReorderItem(string Id, int Order);
public record ReorderScenesCommand(List<ReorderItem> Items) : IRequest;

public class ReorderScenesCommandHandler : IRequestHandler<ReorderScenesCommand>
{
    private readonly SceneRepository _sceneRepo;

    public ReorderScenesCommandHandler(SceneRepository sceneRepo)
    {
        _sceneRepo = sceneRepo;
    }

    public async Task Handle(ReorderScenesCommand request, CancellationToken cancellationToken) =>
        await _sceneRepo.ReorderAsync(request.Items.Select(i => (i.Id, i.Order)).ToList());
}

// ─── Toggle Scene Visibility ──────────────────────────────────────────────────
public record ToggleSceneCommand(string Id, bool IsVisible) : IRequest;

public class ToggleSceneCommandHandler : IRequestHandler<ToggleSceneCommand>
{
    private readonly SceneRepository _sceneRepo;

    public ToggleSceneCommandHandler(SceneRepository sceneRepo)
    {
        _sceneRepo = sceneRepo;
    }

    public async Task Handle(ToggleSceneCommand request, CancellationToken cancellationToken) =>
        await _sceneRepo.ToggleVisibilityAsync(request.Id, request.IsVisible);
}

// ─── Update Scene Content (title/description) ─────────────────────────────────
public record UpdateSceneContentCommand(string Id, string Title, string Description) : IRequest;

public class UpdateSceneContentCommandHandler : IRequestHandler<UpdateSceneContentCommand>
{
    private readonly SceneRepository _sceneRepo;

    public UpdateSceneContentCommandHandler(SceneRepository sceneRepo)
    {
        _sceneRepo = sceneRepo;
    }

    public async Task Handle(UpdateSceneContentCommand request, CancellationToken cancellationToken)
    {
        var scene = await _sceneRepo.GetByIdAsync(request.Id);
        if (scene is null) return;
        scene.Title = request.Title;
        scene.Description = request.Description;
        await _sceneRepo.UpdateAsync(scene);
    }
}
