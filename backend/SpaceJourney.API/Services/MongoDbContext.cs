using MongoDB.Driver;
using SpaceJourney.API.Models;

namespace SpaceJourney.API.Services;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IConfiguration configuration)
    {
        var connectionString = configuration["MongoDB:ConnectionString"]
            ?? throw new InvalidOperationException("MongoDB:ConnectionString is not configured.");
        var databaseName = configuration["MongoDB:DatabaseName"] ?? "space_journey";

        var settings = MongoClientSettings.FromConnectionString(connectionString);
        settings.ServerSelectionTimeout = TimeSpan.FromSeconds(30);
        settings.ConnectTimeout = TimeSpan.FromSeconds(15);
        settings.SocketTimeout = TimeSpan.FromSeconds(30);

        // Bỏ qua certificate validation cho dev — chỉ dành cho môi trường local
        var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
        if (isDevelopment)
        {
            settings.SslSettings = new SslSettings
            {
                ServerCertificateValidationCallback = (sender, cert, chain, errors) => true,
                EnabledSslProtocols = System.Security.Authentication.SslProtocols.Tls12
            };
        }

        var client = new MongoClient(settings);
        _database = client.GetDatabase(databaseName);
    }

    public IMongoCollection<Scene> Scenes =>
        _database.GetCollection<Scene>("scenes");

    public IMongoCollection<Astronaut> Astronauts =>
        _database.GetCollection<Astronaut>("astronauts");

    public IMongoCollection<AdminUser> AdminUsers =>
        _database.GetCollection<AdminUser>("admin_users");
}
