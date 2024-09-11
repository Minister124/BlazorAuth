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
        private static string SerializeObj<T>(T obj) => //T because we don't know what type LocalStorage, token will be passed here, but will be returned as string
            JsonSerializer.Serialize( //Serialize method of JsonSerialize to serialize the passed obj
                obj,
                new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase, PropertyNameCaseInsensitive = true } //we want as FirstName not firstname and these options come from JsonSerializer options
            );

        //Helper to decrypt the Json string
        private static T DeserializeJsonString<T>(string jsonString) => //T because we don't know what type will be returned here, user, roles etc. but we know that string value will be passed as parameter
            JsonSerializer.Deserialize<T>( //<T> for the same reason as above and Deserialize method from Json Serializer to deserialize the passed json serialized data
                jsonString,
                new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase, PropertyNameCaseInsensitive = true } //we want as FirstName not firstname and these options come from JsonSerializer options
            )!;

        // Helper to encrypt data before storing in LocalStorage
        private string Encrypt(string data)
        {
            // 1. Create an AES encryption object.
            using var aes = Aes.Create();

            // 2. Set the encryption key by converting the `_encryptionKey` (which is a string) to a byte array.
            aes.Key = Encoding.UTF8.GetBytes(_encryptionKey);

            // 3. Generate an initialization vector (IV), which is used to make encryption more secure.
            aes.GenerateIV();

            // 4. Convert the IV to a Base64 string to store it with the encrypted data.
            var iv = Convert.ToBase64String(aes.IV);

            // 5. Create an encryptor object based on the AES settings (key and IV).
            var encryptor = aes.CreateEncryptor();

            // 6. Create a memory stream to store the encrypted data in memory.
            using var ms = new MemoryStream();

            // 7. Create a crypto stream, which ties the memory stream with the encryption transformation.
            //    It will write the encrypted data to the memory stream.
            using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))

            // 8. Create a stream writer to write the `data` to the crypto stream, which in turn encrypts it.
            using (var sw = new StreamWriter(cs))
            {
                // 9. Write the plain text data (input) to the crypto stream, where it gets encrypted.
                sw.Write(data);
            }

            // 10. Convert the encrypted data from the memory stream to a Base64 string.
            var encryptedData = Convert.ToBase64String(ms.ToArray());

            // 11. Return a combination of IV and the encrypted data, separated by a colon.
            // This is done so that the IV can be used later for decryption.
            return $"{iv}:{encryptedData}";
        }

        // Helper to decrypt data when retrieving from LocalStorage
        private string Decrypt(string encryptedData)
        {
            // 1. Split the input `encryptedData` using the colon as a separator.
            //    This gives us the IV and the actual encrypted data.
            var parts = encryptedData.Split(':');

            // 2. Convert the IV from Base64 format back to a byte array.
            var iv = Convert.FromBase64String(parts[0]);

            // 3. Convert the encrypted part of the data (also Base64) back to a byte array.
            var cipherText = Convert.FromBase64String(parts[1]);

            // 4. Create a new AES decryption object.
            using var aes = Aes.Create();

            // 5. Set the same key that was used for encryption (this is why both methods use `_encryptionKey`).
            aes.Key = Encoding.UTF8.GetBytes(_encryptionKey);

            // 6. Set the IV that was stored with the encrypted data.
            aes.IV = iv;

            // 7. Create a decryptor object to reverse the encryption transformation.
            var decryptor = aes.CreateDecryptor();

            // 8. Create a memory stream to hold the encrypted data (cipher text).
            using var ms = new MemoryStream(cipherText);

            // 9. Create a crypto stream to decrypt the data as it's read from the memory stream.
            using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);

            // 10. Create a stream reader to read the decrypted data (which will be plain text).
            using var sr = new StreamReader(cs);

            // 11. Return the decrypted plain text as a string.
            return sr.ReadToEnd();
        }

        /*We are passing model of LocalStorageDTO in this method to serialize the data and encrypt it
        and save it in local storage of borwser and to identify that encrypted data,
        we are also saing browserStorageKey with it*/
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

        /*We are getting the encrypted data from browserlocal storage and to know which encrypted data,
        we are passing browserstoragekey to identify it. Once the data is captured it is decrypted and after that
        the decrypted is deserialized and returned as LocalStorageDTO as that is what we want return. Why? Because that
        is what we encrypted after serializing above
        */
        // public async Task<LocalStorageDTO?> GetBrowserLocalStorageAsync()
        // {
        //     try
        //     {
        //         var encryptedData = await _localStorageService.GetItemAsStringAsync(
        //             Constants.BrowserStorageKey
        //         );
        //         if (string.IsNullOrEmpty(encryptedData))
        //             return null;

        //         var decryptedData = Decrypt(encryptedData);
        //         return DeserializeJsonString<LocalStorageDTO>(decryptedData);
        //     }
        //     catch
        //     {
        //         return null;
        //     }
        // }

        /* This is the same method as above but without decrypting and deserializing the data
        and I am creating this just in case. But mine code of above is better one. I don't know what weed
        is the tutorial guy smoking. So, for now I am going with same output but not code from tutorial */
        private async Task<string?> GetBrowserLocalStorageAsync()
        {
            try
            {
                // Get the encrypted data from localStorage
                var encryptedData = await _localStorageService.GetItemAsStringAsync(
                    Constants.BrowserStorageKey
                );

                // Check if the encrypted data is empty or null
                if (string.IsNullOrEmpty(encryptedData))
                    return null;

                // Return the encrypted data directly (no decryption or deserialization)
                return encryptedData;
            }
            catch
            {
                return null;
            }
        }

        public async Task<LocalStorageDTO> GetModelFromTokenAsync()
        {
            try
            {
                var encryptedData = await GetBrowserLocalStorageAsync();
                if (string.IsNullOrEmpty(encryptedData) || string.IsNullOrWhiteSpace(encryptedData))
                {
                    return new LocalStorageDTO();
                }
                var decryptedData = Decrypt(encryptedData);
                return DeserializeJsonString<LocalStorageDTO>(decryptedData);
            }
            catch
            {
                return new LocalStorageDTO();
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
