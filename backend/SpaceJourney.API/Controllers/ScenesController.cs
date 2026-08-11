using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpaceJourney.API.Features.Scenes;

namespace SpaceJourney.API.Controllers;

[ApiController]
[Route("api/scenes")]
public class ScenesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ScenesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>GET /api/scenes — Lấy toàn bộ hành trình (public)</summary>
    [HttpGet]
    public async Task<IActionResult> GetScenes([FromQuery] bool adminView = false)
    {
        var scenes = await _mediator.Send(new GetScenesQuery(adminView));
        return Ok(scenes);
    }

    /// <summary>PATCH /api/scenes/reorder — Đổi thứ tự cảnh (admin)</summary>
    [HttpPatch("reorder")]
    [Authorize]
    public async Task<IActionResult> Reorder([FromBody] ReorderScenesRequest request)
    {
        var items = request.Items.Select(i => new ReorderItem(i.Id, i.Order)).ToList();
        await _mediator.Send(new ReorderScenesCommand(items));
        return NoContent();
    }

    /// <summary>PATCH /api/scenes/{id}/toggle — Bật/tắt cảnh (admin)</summary>
    [HttpPatch("{id}/toggle")]
    [Authorize]
    public async Task<IActionResult> Toggle(string id, [FromBody] ToggleRequest request)
    {
        await _mediator.Send(new ToggleSceneCommand(id, request.IsVisible));
        return NoContent();
    }

    /// <summary>PUT /api/scenes/{id}/content — Cập nhật text tiêu đề/mô tả (admin)</summary>
    [HttpPut("{id}/content")]
    [Authorize]
    public async Task<IActionResult> UpdateContent(string id, [FromBody] UpdateContentRequest request)
    {
        await _mediator.Send(new UpdateSceneContentCommand(id, request.Title, request.Description));
        return NoContent();
    }
}

// DTOs riêng cho Controller (tránh conflict với Features records)
public record ReorderScenesRequest(List<ReorderItemDto> Items);
public record ReorderItemDto(string Id, int Order);
public record ToggleRequest(bool IsVisible);
public record UpdateContentRequest(string Title, string Description);
