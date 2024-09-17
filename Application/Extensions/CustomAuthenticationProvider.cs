using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Application.DTOs.Request.Account;
using Application.DTOs.Response.Account;
using Microsoft.AspNetCore.Components.Authorization;

namespace Application.Extensions;

public class CustomAuthenticationProvider : AuthenticationStateProvider
{
    private readonly ClaimsPrincipal anonymous = new(new ClaimsIdentity());
    private readonly LocalStorageService _localStorageService;

    public CustomAuthenticationProvider(LocalStorageService localStorageService)
    {
        _localStorageService = localStorageService;
    }

    public override async Task<AuthenticationState> GetAuthenticationStateAsync()
    {
        var tokenModel = await _localStorageService.GetModelFromTokenAsync();
        if (string.IsNullOrEmpty(tokenModel.Token))
            return await Task.FromResult(new AuthenticationState(anonymous));

        var getUserClaims = DecryptToken(tokenModel.Token!);
        if (getUserClaims == null)
            return await Task.FromResult(new AuthenticationState(anonymous));

        var ClaimsPrincipal = SetClaimPrincipal(getUserClaims);
        return await Task.FromResult(new AuthenticationState(ClaimsPrincipal));
    }

    public async Task UpdateAuthenticationState(LocalStorageDTO localStorageDTO)
    {
        var claimsPrinciple = new ClaimsPrincipal();
        if (localStorageDTO.Token != null || localStorageDTO.RefreshToken != null)
        {
            await _localStorageService.SetBrowserLocalStorageAsync(localStorageDTO);
            var getUserClaims = DecryptToken(localStorageDTO.Token!);
            claimsPrinciple = SetClaimPrincipal(getUserClaims);
        }
        else
        {
            await _localStorageService.RemoveBrowserLocalStorageAsync();
        }
        NotifyAuthenticationStateChanged(Task.FromResult(new AuthenticationState(claimsPrinciple)));
    }

    public static ClaimsPrincipal SetClaimPrincipal(UserClaimsDTO userClaims)
    {
        if (userClaims.Email is null)
            return new ClaimsPrincipal();
        return new ClaimsPrincipal(
            new ClaimsIdentity(
                [
                    new(ClaimTypes.Name, userClaims.UserName!),
                    new(ClaimTypes.Email, userClaims.Email!),
                    new(ClaimTypes.Role, userClaims.Role!),
                    new Claim("FullName", userClaims.Fullname!),
                ],
                Constants.AuthenticationType
            )
        );
    }

    private static UserClaimsDTO DecryptToken(string jwtToken)
    {
        try
        {
            if(string.IsNullOrEmpty(jwtToken)) return new UserClaimsDTO();
            var handler = new JwtSecurityTokenHandler();
            var token = handler.ReadJwtToken(jwtToken);

            var name = token.Claims.FirstOrDefault(_ => _.Type == ClaimTypes.Name)!.Value;
            var email = token.Claims.FirstOrDefault(_ => _.Type == ClaimTypes.Email)!.Value;
            var role = token.Claims.FirstOrDefault(_ => _.Type == ClaimTypes.Role)!.Value;
            var fullName = token.Claims.FirstOrDefault(_ => _.Type == "FullName")!.Value;
            return new UserClaimsDTO(fullName, name, email, role);
        }
        catch
        {
            return null!;
        }
    }
}
