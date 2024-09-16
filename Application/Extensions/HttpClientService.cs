using System;
using System.Net.Http.Headers;
using Microsoft.Extensions.Logging;

namespace Application.Extensions;

public class HttpClientService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly LocalStorageService _localStorageService;

    private readonly ILogger<HttpClient> _logger;

    public HttpClientService(
        IHttpClientFactory httpClientFactory,
        LocalStorageService localStorageService,
        ILogger<HttpClient> logger
    )
    {
        _httpClientFactory = httpClientFactory;
        _localStorageService = localStorageService;
        _logger = logger;
    }

    private HttpClient CreateClient() => _httpClientFactory!.CreateClient(Constants.HttpClientName); //creates a new HttpClient using name Client.UI as Client.UI is the client of my app

    public HttpClient GetPublicClient() => _httpClientFactory.CreateClient(); //public access with no authorization for like guest user with no login

    public async Task<HttpClient> GetPrivateClientAsync() //For authorization and for authenticated request using Bearer authentication scheme
    {
        try
        {
            var client = CreateClient();
            //Fecth token from local storage and set authorization header
            var token = await GetTokenAsync();
            if(!string.IsNullOrEmpty(token)){
                SetAuthorizationHeader(client, token);
            }
            return client;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create private client");
            return null;
        }
    }

    //Gets the token from local storage
    private async Task<string?> GetTokenAsync()
    {
        var localStorage = await _localStorageService.GetModelFromTokenAsync();
        return localStorage.Token;
    }

    private void SetAuthorizationHeader(HttpClient httpClient, string token)
    {
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            Constants.HttpClientHeaderScheme,
            token
        );
    }
}
