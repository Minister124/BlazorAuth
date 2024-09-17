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

    public async Task<TResponse?> PostRequestAsync<TRequest, TResponse>(
        string route,
        TRequest? model = default,
        bool isPrivate = false
    )
    {
        try
        {
            HttpClient client;
            if (isPrivate)
            {
                client = await _httpClientService.GetPrivateClientAsync();
                if (client == null)
                {
                    _logger.LogError("Failed to create a private client for {Route}", route);
                    return default;
                }
            }
            else
            {
                client = _httpClientService.GetPublicClient();
            }

            // Make the POST request, serializing the model as JSON if provided
            HttpResponseMessage responseMessage =
                model != null
                    ? await client.PostAsJsonAsync(route, model)
                    : await client.PostAsync(route, null);

            // Check if the response indicates a successful status code
            string error = CheckResponseStatus(responseMessage);
            if (!string.IsNullOrEmpty(error))
            {
                _logger.LogError("Request to {Route} failed: {Error}", route, error);
                return default;
            }

            // Deserialize the response if TResponse is expected
            if (typeof(TResponse) != typeof(void))
            {
                var result = await responseMessage.Content.ReadFromJsonAsync<TResponse>();
                return result;
            }

            return default;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Request to {Route} failed with an exception", route);
            return default;
        }
    }

    public async Task<GeneralResponse> ChangeUserRoleRequestAsync(ChangeUserRoleRequest model)
    {
        try
        {
            var result = await PostRequestAsync<ChangeUserRoleRequest, GeneralResponse>(
                Constants.ChangeUserRoleRoute,
                model,
                isPrivate: true
            );
            if (result != null)
            {
                _logger.LogInformation(
                    "Successfully changed the user role for {userEmail}",
                    model.userEmail
                );
                return result;
            }
            _logger.LogError("Request Failed to change user role for {userEmail}", model.userEmail);
            return new GeneralResponse(false, "Failed to Change user Role");
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Exception occured while changing user role for {UserEmail}",
                model.userEmail
            );
            return new GeneralResponse(false, ex.Message);
        }
    }

    public async Task<GeneralResponse> CreateAccountAsync(CreateAccountDTO model)
    {
        try{
            var result = await PostRequestAsync<CreateAccountDTO, GeneralResponse>(Constants.RegisterRoute, model, isPrivate: false);
            if (result != null){
                _logger.LogInformation("Account created successfully for {username}", model.UserName);
                return result;
            }
            _logger.LogError("Creation Failed!!. Failed to create account for {username}", model.UserName);
            return new GeneralResponse(false, "Failed to create account");
        }catch(Exception ex){
            _logger.LogError(ex, "Exception occured during account creation for {username}", model.UserName);
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
        try
        {
            var publicClient = _httpClientService.GetPublicClient();
            var response = await publicClient.PostAsJsonAsync(Constants.RefreshTokenRoute, model);
            string error = CheckResponseStatus(response);
            if (!string.IsNullOrEmpty(error))
                return new LoginResponse(false, error);
            var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
            return result!;
        }
        catch (Exception ex)
        {
            return new LoginResponse(false, ex.Message);
        }
    }
}
