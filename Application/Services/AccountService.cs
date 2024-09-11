using System;
using System.Net.Http.Json;
using Application.DTOs.Request.Account;
using Application.DTOs.Response;
using Application.DTOs.Response.Account;
using Application.Extensions;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class AccountService : IAccountService
{
    private readonly HttpClientService _httpClientService;
    private readonly ILogger<AccountService> _logger;

    public AccountService(HttpClientService httpClientService, ILogger<AccountService> logger)
    {
        _httpClientService = httpClientService;
        _logger = logger;
    }

    public Task<GeneralResponse> ChangeUserRoleRequestAsync(ChangeUserRoleRequest model)
    {
        throw new NotImplementedException();
    }

    public Task<GeneralResponse> CreateAccountAsync(CreateAccountDTO model)
    {
        throw new NotImplementedException();
    }

    public Task CreateAdmin()
    {
        throw new NotImplementedException();
    }

    public Task<GeneralResponse> CreateRoleAsync(CreateRoleDTO model)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<GetRoleDTO>> GetRoleAsync()
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<GetUsersWithRolesResponseDTO>> GetUsersWithRolesResponseAsync()
    {
        throw new NotImplementedException();
    }

    public async Task<LoginResponse> LoginAsync(LoginDTO model)
    {
        try
        {
            var publicClient = _httpClientService.GetPublicClient();
            var response = await publicClient.PostAsJsonAsync(Constants.LoginRoute, model);
            string error = CheckResponseStatus(response);
            if (!string.IsNullOrEmpty(error))
                return new LoginResponse(false, error);
            var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
            _logger.LogInformation("Successfully Logged In");
            return result!;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login Failed");
            return new LoginResponse(false, ex.Message);
        }
    }

    private string CheckResponseStatus(HttpResponseMessage response)
    {
        throw new NotImplementedException();
    }

    public Task<LoginResponse> RefreshTokenAsync(RefreshTokenDTO model)
    {
        throw new NotImplementedException();
    }
}
