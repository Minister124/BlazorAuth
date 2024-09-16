using System;
using System.Net.Http.Json;
using System.Reflection.Metadata;
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

    public async Task<GeneralResponse> ChangeUserRoleRequestAsync(ChangeUserRoleRequest model)
    {
        try
        {
            var privateClient = await _httpClientService.GetPrivateClientAsync();
            var response = await privateClient.PostAsJsonAsync(
                Constants.ChangeUserRoleRoute,
                model
            );
            string error = CheckResponseStatus(response);
            if (!string.IsNullOrEmpty(error))
                return new GeneralResponse(false, error);
            var result = await response.Content.ReadFromJsonAsync<GeneralResponse>();
            return result!;
        }
        catch (Exception ex)
        {
            return new GeneralResponse(false, ex.Message);
        }
    }

    public async Task<GeneralResponse> CreateAccountAsync(CreateAccountDTO model)
    {
        try
        {
            var publicClient = _httpClientService.GetPublicClient();
            var response = await publicClient.PostAsJsonAsync(Constants.RegisterRoute, model);
            string error = CheckResponseStatus(response);
            if (!string.IsNullOrEmpty(error))
                return new GeneralResponse(false, error);
            var result = await response.Content.ReadFromJsonAsync<GeneralResponse>();
            return result!;
        }
        catch (Exception ex)
        {
            return new GeneralResponse(false, ex.Message);
        }
    }

    public async Task CreateAdmin()
    {
        try
        {
            var client = _httpClientService.GetPublicClient();
            await client.PostAsync(Constants.CreateAdminRoute, null);
        }
        catch { }
    }

    public Task<GeneralResponse> CreateRoleAsync(CreateRoleDTO model)
    {
        throw new NotImplementedException();
    }

    public async Task<IEnumerable<GetRoleDTO>> GetRoleAsync()
    {
        try
        {
            var privateClient = await _httpClientService.GetPrivateClientAsync();
            var response = await privateClient.GetAsync(Constants.GetRolesRoute);
            string error = CheckResponseStatus(response);
            if (!string.IsNullOrEmpty(error))
                throw new Exception(error);
            var result = await response.Content.ReadFromJsonAsync<IEnumerable<GetRoleDTO>>();
            return result!;
        }
        catch (Exception ex)
        {
            throw new Exception(ex.Message);
        }
    }

    // public IEnumerable<GetRoleDTO> GetDefaultRoles(){
    //     var list = new List<GetRoleDTO>();
    //     list?.Clear();
    //     list.Add(new GetRoleDTO(1.ToString(), Constants.Role.Admin));
    //     list.Add(new GetRoleDTO(1.ToString(), Constants.Role.User));
    //     return list;
    // }

    public async Task<IEnumerable<GetUsersWithRolesResponseDTO>> GetUsersWithRolesResponseAsync()
    {
        try
        {
            var privateClient = await _httpClientService.GetPrivateClientAsync();
            var response = await privateClient.GetAsync(Constants.GetUserWithRolesRoute);
            string error = CheckResponseStatus(response);
            if (!string.IsNullOrEmpty(error))
                throw new Exception(error);
            var result = await response.Content.ReadFromJsonAsync<
                IEnumerable<GetUsersWithRolesResponseDTO>
            >();
            return result!;
        }
        catch (Exception ex)
        {
            throw new Exception(ex.Message);
        }
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

    private static string CheckResponseStatus(HttpResponseMessage response)
    {
        if (!response.IsSuccessStatusCode)
            return $"Error Description:{Environment.NewLine}Status Code:{response.StatusCode}{Environment.NewLine}Reason Phrase: {response.ReasonPhrase}";
        else
            return null;
    }

    public async Task<LoginResponse> RefreshTokenAsync(RefreshTokenDTO model)
    {
        try{
            var publicClient = _httpClientService.GetPublicClient();
            var response = await publicClient.PostAsJsonAsync(Constants.RefreshTokenRoute, model);
            string error = CheckResponseStatus(response);
            if(!string.IsNullOrEmpty(error))
                return new LoginResponse(false, error);
            var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
            return result!;
        } catch(Exception ex){
            return new LoginResponse(false, ex.Message);
        }
    }
}
