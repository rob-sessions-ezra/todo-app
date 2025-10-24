using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

namespace Todo.Api.Services;

public interface IPasswordHasher
{
    (string hash, string salt) Hash(string password);
    bool Verify(string password, string storedHash, string storedSalt);
}

public sealed class PasswordHasher : IPasswordHasher
{
    public (string hash, string salt) Hash(string password)
    {
        var saltBytes = RandomNumberGenerator.GetBytes(16);
        var hashBytes = KeyDerivation.Pbkdf2(
            password, saltBytes, KeyDerivationPrf.HMACSHA256, 100_000, 32);

        return (Convert.ToBase64String(hashBytes), Convert.ToBase64String(saltBytes));
    }

    public bool Verify(string password, string storedHash, string storedSalt)
    {
        var saltBytes = Convert.FromBase64String(storedSalt);
        var hashBytes = KeyDerivation.Pbkdf2(
            password, saltBytes, KeyDerivationPrf.HMACSHA256, 100_000, 32);

        return CryptographicOperations.FixedTimeEquals(
            Convert.FromBase64String(storedHash), hashBytes);
    }
}
