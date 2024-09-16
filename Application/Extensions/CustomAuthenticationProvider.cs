using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Components.Authorization;

namespace Application.Extensions;

public class CustomAuthenticationProvider : AuthenticationStateProvider
{
    private readonly ClaimsPrincipal anonymous = new(new ClaimsIdentity());
    private readonly LocalStorageService _localStorageService;

    public CustomAuthenticationProvider(LocalStorageService localStorageService){
        _localStorageService = localStorageService;
    }

    public override async Task<AuthenticationState> GetAuthenticationStateAsync(){
        var tokenModel = await _localStorageService.GetModelFromTokenAsync();
        if(string.IsNullOrEmpty(tokenModel.Token)) return await Task.FromResult(new AuthenticationState(anonymous));

        var getUserClaims = DecryptToken(tokenModel.Token!);
        if(getUserClaims == null) return await Task.FromResult(new AuthenticationState(anonymous));

        var ClaimsPrincipal = SetClaimPrincipal(getUserClaims);
        return await Task.FromResult(new AuthenticationState(ClaimsPrincipal));
    }

    private ClaimsPrincipal SetClaimPrincipal(object getUserClaims)
    {
        throw new NotImplementedException();
    }

    private object DecryptToken(string v)
    {
        throw new NotImplementedException();
    }
}
