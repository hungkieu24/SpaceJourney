using MongoDB.Driver;
using SpaceJourney.API.Models;
using SpaceJourney.API.Services;

namespace SpaceJourney.API.Repositories;

public class AstronautRepository
{
    private readonly IMongoCollection<Astronaut> _astronauts;

    public AstronautRepository(MongoDbContext context)
    {
        _astronauts = context.Astronauts;
    }

    public async Task EnsureIndexesAsync()
    {
        var indexModel = new CreateIndexModel<Astronaut>(
            Builders<Astronaut>.IndexKeys
                .Ascending(a => a.SceneId)
                .Ascending(a => a.Order));
        await _astronauts.Indexes.CreateOneAsync(indexModel);
    }

    public async Task<List<Astronaut>> GetAllVisibleAsync() =>
        await _astronauts.Find(a => a.IsVisible).SortBy(a => a.Order).ToListAsync();

    public async Task<List<Astronaut>> GetBySceneIdAsync(string sceneId) =>
        await _astronauts.Find(a => a.SceneId == sceneId && a.IsVisible)
            .SortBy(a => a.Order).ToListAsync();

    public async Task<List<Astronaut>> GetAllBySceneIdAsync(string sceneId) =>
        await _astronauts.Find(a => a.SceneId == sceneId)
            .SortBy(a => a.Order).ToListAsync();

    public async Task<Astronaut?> GetByIdAsync(string id) =>
        await _astronauts.Find(a => a.Id == id).FirstOrDefaultAsync();

    public async Task InsertAsync(Astronaut astronaut) =>
        await _astronauts.InsertOneAsync(astronaut);

    public async Task UpdateAsync(Astronaut astronaut)
    {
        astronaut.UpdatedAt = DateTime.UtcNow;
        await _astronauts.ReplaceOneAsync(a => a.Id == astronaut.Id, astronaut);
    }

    public async Task ToggleVisibilityAsync(string id, bool isVisible) =>
        await _astronauts.UpdateOneAsync(
            a => a.Id == id,
            Builders<Astronaut>.Update
                .Set(a => a.IsVisible, isVisible)
                .Set(a => a.UpdatedAt, DateTime.UtcNow));

    public async Task ReorderAsync(List<(string Id, int Order)> reorderItems)
    {
        var updates = reorderItems.Select(item =>
            new UpdateOneModel<Astronaut>(
                Builders<Astronaut>.Filter.Eq(a => a.Id, item.Id),
                Builders<Astronaut>.Update
                    .Set(a => a.Order, item.Order)
                    .Set(a => a.UpdatedAt, DateTime.UtcNow)));
        await _astronauts.BulkWriteAsync(updates);
    }

    public async Task DeleteAsync(string id) =>
        await _astronauts.DeleteOneAsync(a => a.Id == id);
}
