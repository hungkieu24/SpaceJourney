using SpaceJourney.API.Repositories;
using BCrypt.Net;

namespace SpaceJourney.API.Extensions;

public static class DatabaseExtensions
{
    public static async Task SeedDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var sceneRepo = scope.ServiceProvider.GetRequiredService<SceneRepository>();
        var userRepo = scope.ServiceProvider.GetRequiredService<AdminUserRepository>();
        var astronautRepo = scope.ServiceProvider.GetRequiredService<AstronautRepository>();
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        try
        {
            // Tạo indexes (idempotent — không lỗi nếu đã tồn tại)
            await sceneRepo.EnsureIndexesAsync();
            await userRepo.EnsureIndexesAsync();
            await astronautRepo.EnsureIndexesAsync();
            Console.WriteLine("✅ MongoDB indexes ensured.");

            // Seed 5 default scenes nếu chưa có
            var existingScenes = await sceneRepo.GetAllAsync();
            if (existingScenes.Count == 0)
            {
                var defaultScenes = new[]
                {
                    new SpaceJourney.API.Models.Scene { ComponentType = "globe", DisplayName = "Trái Đất", Title = "Khởi Hành", Description = "Hành trình bắt đầu từ ngôi nhà xanh của chúng ta.", Order = 0 },
                    new SpaceJourney.API.Models.Scene { ComponentType = "particle-sphere", DisplayName = "Vũ Trụ Lấp Lánh", Title = "Trôi Vào Vũ Trụ", Description = "Những hạt sao dẫn đường cho chúng ta.", Order = 1 },
                    new SpaceJourney.API.Models.Scene { ComponentType = "black-hole", DisplayName = "Hố Đen", Title = "Khu Vực Nguy Hiểm", Description = "Cẩn thận — lực hút của hố đen rất mạnh.", Order = 2 },
                    new SpaceJourney.API.Models.Scene { ComponentType = "tornado", DisplayName = "Cơn Bão Vũ Trụ", Title = "Cơn Lốc Thiên Hà", Description = "Cơn bão không gian cuốn tất cả vào trung tâm.", Order = 3 },
                    new SpaceJourney.API.Models.Scene { ComponentType = "glitter-wrap", DisplayName = "Thiên Hà Mới", Title = "Đích Đến", Description = "Chào mừng đến thiên hà mới — hành trình kết thúc tại đây.", Order = 4 },
                };
                foreach (var scene in defaultScenes)
                    await sceneRepo.InsertAsync(scene);
            }

            // Seed admin user nếu chưa có
            if (!await userRepo.ExistsAsync())
            {
                var adminUsername = "admin";
                var adminPassword = "Admin@SpaceJourney2026!";
                var adminUser = new SpaceJourney.API.Models.AdminUser
                {
                    Username = adminUsername,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword)
                };
                await userRepo.InsertAsync(adminUser);
                Console.WriteLine($"✅ Admin user '{adminUsername}' seeded.");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️ Seed/Index creation skipped: {ex.Message.Split('\n')[0]}");
        }
    }
}
