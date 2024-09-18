using System;
using Application.Extensions;
using Application.Services;
using Blazored.LocalStorage;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.Extensions.DependencyInjection;

namespace Application.DependencyInjection;

public static class ServiceInjection
{
    public static IServiceCollection AddApplicationService(this IServiceCollection services){
        services.AddScoped<IAccountService, AccountService>();
        services.AddAuthorizationCore();
        services.AddBlazoredLocalStorage();
        services.AddScoped<LocalStorageService>();
        services.AddScoped<HttpClientService>();
        services.AddScoped<AuthenticationStateProvider, CustomAuthenticationProvider>();
        services.AddTransient<CustomHttpHandler>();
        services.AddCascadingAuthenticationState();
        services.AddHttpClient("Client.UI", client => {
            client.BaseAddress = new Uri("https://localhost:7284/");
        }).AddHttpMessageHandler<CustomHttpHandler>();
        return services;
    }
}
