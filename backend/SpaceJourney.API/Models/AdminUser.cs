using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SpaceJourney.API.Models;

public class AdminUser
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    public string Username { get; set; } = string.Empty;

    /// <summary>BCrypt hashed password — không bao giờ lưu plaintext</summary>
    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
