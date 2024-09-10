using System;
using NetcodeHub.Packages.Extensions.LocalStorage;

namespace Application.Extensions;

public class LocalStorageService
{
    private readonly ILocalStorageService _localStorageService;

    public LocalStorageService(ILocalStorageService localStorageService)
    {
        _localStorageService = localStorageService;
    }

    private async Task<string> GetBrowserLocalStorage()
    {
        var tokenModel = await _localStorageService.GetEncryptedItemAsStringAsync(
            Constants.BrowserStorageKey
        );
        if (string.IsNullOrEmpty(tokenModel)){
            return null;
        }
        return tokenModel;
    }
    
}
