using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SpaceJourney.API.Models;

public class Astronaut
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    public string Name { get; set; } = string.Empty;

    /// <summary>1-2 dòng mô tả ngắn, ví dụ: "Phi hành gia Nguyễn Văn A, chuyến bay 2026"</summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>URL ảnh trên Cloudinary</summary>
    public string CloudinaryUrl { get; set; } = string.Empty;

    /// <summary>Public ID trên Cloudinary, dùng để xóa ảnh khi cần</summary>
    public string CloudinaryPublicId { get; set; } = string.Empty;

    /// <summary>ID của cảnh mà ảnh này thuộc về</summary>
    [BsonRepresentation(BsonType.ObjectId)]
    public string SceneId { get; set; } = string.Empty;

    /// <summary>Thứ tự hiển thị trong cảnh (admin kéo thả)</summary>
    public int Order { get; set; }

    /// <summary>Nếu false, ảnh bị ẩn khỏi trang người dùng</summary>
    public bool IsVisible { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
