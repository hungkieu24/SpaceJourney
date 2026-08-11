using MongoDB.Driver;
using SpaceJourney.API.Models;
using SpaceJourney.API.Services;

namespace SpaceJourney.API.Repositories;

public class AdminUserRepository
{
    private readonly IMongoCollection<AdminUser> _users;

    public AdminUserRepository(MongoDbContext context)
    {
        _users = context.AdminUsers;
    }

    public async Task EnsureIndexesAsync()
    {
        var indexModel = new CreateIndexModel<AdminUser>(
            Builders<AdminUser>.IndexKeys.Ascending(u => u.Username),
            new CreateIndexOptions { Unique = true });
        await _users.Indexes.CreateOneAsync(indexModel);
    }

    public async Task<AdminUser?> GetByUsernameAsync(string username) =>
        await _users.Find(u => u.Username == username).FirstOrDefaultAsync();

    public async Task<bool> ExistsAsync() =>
        await _users.CountDocumentsAsync(_ => true) > 0;

    public async Task InsertAsync(AdminUser user) =>
        await _users.InsertOneAsync(user);
}
