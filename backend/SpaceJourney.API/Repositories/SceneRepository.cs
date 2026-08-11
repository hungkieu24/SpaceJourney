using MongoDB.Driver;
using SpaceJourney.API.Models;
using SpaceJourney.API.Services;

namespace SpaceJourney.API.Repositories;

public class SceneRepository
{
    private readonly IMongoCollection<Scene> _scenes;

    public SceneRepository(MongoDbContext context)
    {
        _scenes = context.Scenes;
    }

    /// <summary>Tạo indexes bất đồng bộ — gọi sau khi app start</summary>
    public async Task EnsureIndexesAsync()
    {
        var indexModel = new CreateIndexModel<Scene>(
            Builders<Scene>.IndexKeys.Ascending(s => s.Order));
        await _scenes.Indexes.CreateOneAsync(indexModel);
    }

    public async Task<List<Scene>> GetAllAsync() =>
        await _scenes.Find(_ => true).SortBy(s => s.Order).ToListAsync();

    public async Task<List<Scene>> GetVisibleAsync() =>
        await _scenes.Find(s => s.IsVisible).SortBy(s => s.Order).ToListAsync();

    public async Task<Scene?> GetByIdAsync(string id) =>
        await _scenes.Find(s => s.Id == id).FirstOrDefaultAsync();

    public async Task InsertAsync(Scene scene) =>
        await _scenes.InsertOneAsync(scene);

    public async Task UpdateAsync(Scene scene)
    {
        scene.UpdatedAt = DateTime.UtcNow;
        await _scenes.ReplaceOneAsync(s => s.Id == scene.Id, scene);
    }

    public async Task ToggleVisibilityAsync(string id, bool isVisible) =>
        await _scenes.UpdateOneAsync(
            s => s.Id == id,
            Builders<Scene>.Update
                .Set(s => s.IsVisible, isVisible)
                .Set(s => s.UpdatedAt, DateTime.UtcNow));

    public async Task ReorderAsync(List<(string Id, int Order)> reorderItems)
    {
        var updates = reorderItems.Select(item =>
            new UpdateOneModel<Scene>(
                Builders<Scene>.Filter.Eq(s => s.Id, item.Id),
                Builders<Scene>.Update
                    .Set(s => s.Order, item.Order)
                    .Set(s => s.UpdatedAt, DateTime.UtcNow)));
        await _scenes.BulkWriteAsync(updates);
    }

    public async Task DeleteAsync(string id) =>
        await _scenes.DeleteOneAsync(s => s.Id == id);
}
