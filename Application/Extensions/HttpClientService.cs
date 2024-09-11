using System;
using System.Net.Http.Headers;

namespace Application.Extensions;

public class HttpClientService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly LocalStorageService _localStorageService;

    public HttpClientService(
        IHttpClientFactory httpClientFactory,
        LocalStorageService localStorageService
    )
    {
        _httpClientFactory = httpClientFactory;
        _localStorageService = localStorageService;
    }

    private HttpClient CreateClient() => _httpClientFactory!.CreateClient(Constants.HttpClientName); //creates a new HttpClient using name Client.UI as Client.UI is the client of my app

    public HttpClient GetPublicClient() => _httpClientFactory.CreateClient(); //public access with no authorization for like guest user with no login

    public async Task<HttpClient> GetPrivateClient() //For authorization and for authenticated request using Bearer authentication scheme
    {
        try
        {
            var client = CreateClient();
            var localStorage = await _localStorageService.GetModelFromTokenAsync();
            if (string.IsNullOrEmpty(localStorage.Token))
                return client;
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
                Constants.HttpClientHeaderScheme,
                localStorage.Token
            );
            return client;
        }
        catch
        {
            return new HttpClient();
        }
    }
}
