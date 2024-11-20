using System;
using System.Net;
using System.Net.Http.Headers;
using Application.Services;
using Microsoft.AspNetCore.Components;

namespace Application.Extensions;

public class CustomHttpHandler : DelegatingHandler
{
    private readonly LocalStorageService _localstorageService;
    private readonly HttpClientService _httpClientService;

    private readonly NavigationManager _navigationManager;

    private readonly IAccountService _accountService;

    public CustomHttpHandler(
        LocalStorageService localStorageService,
        HttpClientService httpClientService,
        NavigationManager navigationManager,
        IAccountService accountService
    )
    {
        _localstorageService = localStorageService;
        _httpClientService = httpClientService;
        _navigationManager = navigationManager;
        _accountService = accountService;
    }

    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            bool loginUrl = request.RequestUri!.AbsoluteUri.Contains(Constants.LoginRoute);
            bool registerUrl = request.RequestUri!.AbsoluteUri.Contains(Constants.RegisterRoute);
            bool refreshTokenUrl = request.RequestUri!.AbsoluteUri.Contains(
                Constants.RefreshTokenRoute
            );
            bool createAdminUrl = request.RequestUri!.AbsoluteUri.Contains(
                Constants.CreateAdminRoute
            );

            // If the request is for login, register, refresh token, or create admin, directly proceed
            if (loginUrl || registerUrl || refreshTokenUrl || createAdminUrl)
            {
                return await base.SendAsync(request, cancellationToken);
            }

            // Send the request and capture the response
            var result = await base.SendAsync(request, cancellationToken);

            // If the response is Unauthorized, attempt token refresh
            if (result.StatusCode == HttpStatusCode.Unauthorized)
            {
                var tokenModel = await _localstorageService.GetModelFromTokenAsync();
                if (tokenModel == null)
                    return result;

                var newJwtToken = await GetRefreshTokenAsync(tokenModel.RefreshToken!);
                if (string.IsNullOrEmpty(newJwtToken))
                    return result;

                // Attach the new token to the Authorization header and resend the request
                request.Headers.Authorization = new AuthenticationHeaderValue(
                    Constants.HttpClientHeaderScheme,
                    newJwtToken
                );

                // Send the request again with the new token
                result = await base.SendAsync(request, cancellationToken);
            }

            return result; // Return the final response
        }
        catch (Exception ex)
        {
            // Handle any exceptions and return a proper HttpResponseMessage
            var errorResponse = new HttpResponseMessage(HttpStatusCode.InternalServerError)
            {
                Content = new StringContent("An internal server error occurred: " + ex.Message),
            };
            return errorResponse;
        }
    }

    private async Task<string?> GetRefreshTokenAsync(string refresh)
    {
        try
        {
            var client = _httpClientService.GetPublicClient();
            var response = await _accountService.RefreshTokenAsync(
                new DTOs.Request.Account.RefreshTokenDTO() { Token = refresh }
            );
            if (response == null || response.token == null)
            {
                await ClearBrowserStorage();
                NavigateToLogin();
                return null;
            }
            await _localstorageService.RemoveBrowserLocalStorageAsync();
            await _localstorageService.SetBrowserLocalStorageAsync(
                new DTOs.Request.Account.LocalStorageDTO()
                {
                    RefreshToken = response!.refreshToken,
                    Token = response.token,
                }
            );
            return response.token;
        }
        catch
        {
            return null!;
        }
    }

    private void NavigateToLogin()
    {
        _navigationManager.NavigateTo(_navigationManager.BaseUri, true, true);
    }

    private async Task ClearBrowserStorage() =>
        await _localstorageService.RemoveTokenFromBrowserLocalStorageAsync();
}
