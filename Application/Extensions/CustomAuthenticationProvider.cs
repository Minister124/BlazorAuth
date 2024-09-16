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

}
