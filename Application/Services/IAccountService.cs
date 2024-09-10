using Application.DTOs.Request.Account;
using Application.DTOs.Response;
using Application.DTOs.Response.Account;

namespace Application.Services;

public interface IAccountService
{
    Task CreateAdmin();
    Task<GeneralResponse> CreateAccountAsync(CreateAccountDTO model);
    Task<LoginResponse> LoginAsync(LoginDTO model);

    Task<GeneralResponse> ChangeUserRoleRequestAsync(ChangeUserRoleRequest model);

    Task<GeneralResponse> CreateRoleAsync(CreateRoleDTO model);

    Task<LoginResponse> RefreshTokenAsync(RefreshTokenDTO model);

    Task<IEnumerable<GetRoleDTO>> GetRoleAsync();

    Task<IEnumerable<GetUsersWithRolesResponseDTO>> GetUsersWithRolesResponseAsync();
}
