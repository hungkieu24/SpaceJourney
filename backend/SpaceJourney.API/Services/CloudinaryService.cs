using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace SpaceJourney.API.Services;

public class CloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(IConfiguration config)
    {
        var cloudName = config["Cloudinary:CloudName"] ?? "dpbaa45ft";
        var apiKey = config["Cloudinary:ApiKey"] ?? "128953799351396";
        var apiSecret = config["Cloudinary:ApiSecret"]
            ?? throw new InvalidOperationException("Cloudinary:ApiSecret is not configured.");

        var account = new Account(cloudName, apiKey, apiSecret);
        _cloudinary = new Cloudinary(account) { Api = { Secure = true } };
    }

    /// <summary>Upload một file ảnh lên Cloudinary, trả về URL và PublicId</summary>
    public async Task<(string Url, string PublicId)> UploadAsync(IFormFile file, string folder = "astronauts")
    {
        await using var stream = file.OpenReadStream();
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = folder,
            // Chuẩn hóa: crop fill về 400x400, giữ mặt người (nếu có)
            Transformation = new Transformation()
                .Width(400).Height(400).Crop("fill").Gravity("auto")
        };

        var result = await _cloudinary.UploadAsync(uploadParams);

        if (result.Error != null)
            throw new Exception($"Cloudinary upload failed: {result.Error.Message}");

        return (result.SecureUrl.ToString(), result.PublicId);
    }

    /// <summary>Xóa ảnh khỏi Cloudinary theo PublicId</summary>
    public async Task DeleteAsync(string publicId)
    {
        var deleteParams = new DeletionParams(publicId);
        await _cloudinary.DestroyAsync(deleteParams);
    }
}
