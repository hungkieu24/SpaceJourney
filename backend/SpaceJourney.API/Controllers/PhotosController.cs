using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpaceJourney.API.Features.Photos;

namespace SpaceJourney.API.Controllers;

[ApiController]
[Route("api/photos")]
public class PhotosController : ControllerBase
{
    private readonly IMediator _mediator;

    public PhotosController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>GET /api/photos — Lấy ảnh phi hành gia (public)</summary>
    [HttpGet]
    public async Task<IActionResult> GetPhotos([FromQuery] string? sceneId = null, [FromQuery] bool adminView = false)
    {
        var photos = await _mediator.Send(new GetPhotosQuery(sceneId, adminView));
        return Ok(photos);
    }

    /// <summary>POST /api/photos — Upload ảnh mới (admin)</summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Upload([FromForm] UploadPhotoRequest request)
    {
        if (request.File is null || request.File.Length == 0)
            return BadRequest(new { message = "Vui lòng chọn file ảnh." });

        var photo = await _mediator.Send(new UploadPhotoCommand(
            request.File, request.Name, request.Description, request.SceneId));
        return Ok(photo);
    }

    /// <summary>PATCH /api/photos/{id} — Cập nhật thông tin ảnh (admin)</summary>
    [HttpPatch("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(string id, [FromBody] UpdatePhotoRequest request)
    {
        await _mediator.Send(new UpdatePhotoCommand(
            id, request.Name, request.Description, request.SceneId, request.Order, request.IsVisible));
        return NoContent();
    }

    /// <summary>DELETE /api/photos/{id} — Xóa ảnh (admin)</summary>
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(string id)
    {
        await _mediator.Send(new DeletePhotoCommand(id));
        return NoContent();
    }
}

public record UploadPhotoRequest(IFormFile? File, string Name, string Description, string SceneId);
public record UpdatePhotoRequest(string? Name, string? Description, string? SceneId, int? Order, bool? IsVisible);
