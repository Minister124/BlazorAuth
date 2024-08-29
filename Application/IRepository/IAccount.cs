using System;
using Application.DTOs.Request.Account;
using Application.DTOs.Response;
using Application.DTOs.Response.Account;

namespace Application.IRepository
{
    public interface IAccount
    {
        Task CreateAdmin();
        Task<GeneralResponse> CreateAccountAsync(CreateAccountDTO model);
        Task<LoginResponse> LoginAsync(LoginDTO model);

        Task<GeneralResponse> ChangeUserRoleRequestAsync(ChangeUserRoleRequest model);

        Task<GeneralResponse> CreateRoleAsync(CreateRoleDTO model);

        Task<IEnumerable<GetRoleDTO>> GetRoleAsynce();

        Task<IEnumerable<GetUsersWithRolesResponseDTO>> GetUsersWithRolesResponseAsync();   
    }
}
