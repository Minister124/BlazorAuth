using System;
using Application.DTOs.Request.Account;
using Application.DTOs.Response;
using Application.DTOs.Response.Account;

namespace Application.Services;

public class AccountService : IAccountService
{
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

    public Task<LoginResponse> LoginAsync(LoginDTO model)
    {
        throw new NotImplementedException();
    }

    public Task<LoginResponse> RefreshTokenAsync(RefreshTokenDTO model)
    {
        throw new NotImplementedException();
    }
}
