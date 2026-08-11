using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SpaceJourney.API.Models;

public class Scene
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    /// <summary>
    /// Loại component Originkit: "globe" | "particle-sphere" | "black-hole" | "tornado" | "glitter-wrap"
    /// </summary>
    public string ComponentType { get; set; } = string.Empty;

    public string DisplayName { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    /// <summary>Thứ tự hiển thị trong hành trình (0-based, admin có thể thay đổi)</summary>
    public int Order { get; set; }

    /// <summary>Nếu false, cảnh bị bỏ qua trong hành trình người dùng</summary>
    public bool IsVisible { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
