// using System.Text.Json;
// using System.Text.Json.Serialization;
// using Application.DTOs.Request.Account;
// using NetcodeHub.Packages.Extensions.LocalStorage;

// namespace Application.Extensions;

// public class LocalStorageService
// {
//     private readonly ILocalStorageService _localStorageService;

//     public LocalStorageService(ILocalStorageService localStorageService)
//     {
//         _localStorageService = localStorageService;
//     }

//     private async Task<string> GetBrowserLocalStorage()
//     {
//         var tokenModel = await _localStorageService.GetEncryptedItemAsStringAsync(
//             Constants.BrowserStorageKey
//         );
//         if (string.IsNullOrEmpty(tokenModel))
//         {
//             return null;
//         }
//         return tokenModel;
//     }

//     private static JsonSerializerOptions JsonOptions()
//     {
//         return new JsonSerializerOptions
//         {
//             AllowTrailingCommas = true,
//             PropertyNameCaseInsensitive = true,
//             PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
//             UnmappedMemberHandling = JsonUnmappedMemberHandling.Skip,
//         };
//     }

//     private static string SerializeObj<T>(T modelObj) =>
//         JsonSerializer.Serialize(modelObj, JsonOptions());

//     private static T DeSerializeJsonString<T>(string jsonString) =>
//         JsonSerializer.Deserialize<T>(jsonString, JsonOptions())!;

//     public async Task<LocalStorageDTO> GetModelFromToken()
//     {
//         try
//         {
//             string token = await GetBrowserLocalStorage();
//             if (string.IsNullOrEmpty(token) || string.IsNullOrWhiteSpace(token))
//             {
//                 return new LocalStorageDTO();
//             }
//             return DeSerializeJsonString<LocalStorageDTO>(token);
//         }
//         catch
//         {
//             return new LocalStorageDTO();
//         }
//     }

//     public async Task SetBrowserLocaLStorage(LocalStorageDTO localStorageDTO)
//     {
//         try
//         {
//             string token = SerializeObj(localStorageDTO);
//             await _localStorageService.SaveAsEncryptedStringAsync(
//                 Constants.BrowserStorageKey,
//                 token
//             );
//         }
//         catch { }
//     }

//     public async Task RemoveTokenFromBrowserLocalStorage() =>
//         await _localStorageService.DeleteItemAsync(Constants.BrowserStorageKey);
// }

using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Application.DTOs.Request.Account;
using Blazored.LocalStorage;
using Microsoft.Extensions.Configuration;

namespace Application.Extensions
{
    public class LocalStorageService
    {
        private readonly ILocalStorageService _localStorageService;
        private readonly string _encryptionKey;

        public LocalStorageService(
            ILocalStorageService localStorageService,
            IConfiguration configuration
        )
        {
            _localStorageService = localStorageService;

            // Access the EncryptionKey from Secrets.json
            _encryptionKey =
                configuration["EncryptionKey"] ?? throw new Exception("Encryption key not found");
        }

        //Helper to Serialize the objects
        private static string SerializeObj<T>(T obj) =>
            JsonSerializer.Serialize(
                obj,
                new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }
            );

        //Helper to decrypt the Json string
        private static T DeserializeJsonString<T>(string jsonString) =>
            JsonSerializer.Deserialize<T>(
                jsonString,
                new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }
            )!;

        // Helper to encrypt data before storing in LocalStorage
        private string Encrypt(string data)
        {
            using var aes = Aes.Create();
            aes.Key = Encoding.UTF8.GetBytes(_encryptionKey);
            aes.GenerateIV();
            var iv = Convert.ToBase64String(aes.IV);
            var encryptor = aes.CreateEncryptor();
            using var ms = new MemoryStream();
            using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
            using (var sw = new StreamWriter(cs))
            {
                sw.Write(data);
            }

            var encryptedData = Convert.ToBase64String(ms.ToArray());
            return $"{iv}:{encryptedData}"; // Store IV and encrypted data
        }

        // Helper to decrypt data when retrieving from LocalStorage
        private string Decrypt(string encryptedData)
        {
            var parts = encryptedData.Split(':');
            var iv = Convert.FromBase64String(parts[0]);
            var cipherText = Convert.FromBase64String(parts[1]);

            using var aes = Aes.Create();
            aes.Key = Encoding.UTF8.GetBytes(_encryptionKey);
            aes.IV = iv;
            var decryptor = aes.CreateDecryptor();

            using var ms = new MemoryStream(cipherText);
            using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
            using var sr = new StreamReader(cs);
            return sr.ReadToEnd();
        }

        public async Task SetBrowserLocalStorageAsync(LocalStorageDTO localStorageDTO)
        {
            try
            {
                var serializedData = SerializeObj(localStorageDTO);
                var encryptedData = Encrypt(serializedData);
                await _localStorageService.SetItemAsStringAsync(
                    Constants.BrowserStorageKey,
                    encryptedData
                );
            }
            catch (Exception ex)
            {
                // Handle exception (log it)
                Console.WriteLine($"Error setting local storage: {ex.Message}");
            }
        }

        public async Task<LocalStorageDTO?> GetBrowserLocalStorageAsync()
        {
            try
            {
                var encryptedData = await _localStorageService.GetItemAsStringAsync(
                    Constants.BrowserStorageKey
                );
                if (string.IsNullOrEmpty(encryptedData))
                    return null;

                var decryptedData = Decrypt(encryptedData);
                return DeserializeJsonString<LocalStorageDTO>(decryptedData);
            }
            catch
            {
                return null;
            }
        }

        public async Task RemoveBrowserLocalStorageAsync()
        {
            try
            {
                await _localStorageService.RemoveItemAsync(Constants.BrowserStorageKey);
            }
            catch (Exception ex)
            {
                // Handle exception (log it)
                Console.WriteLine($"Error removing local storage: {ex.Message}");
            }
        }
    }
}
