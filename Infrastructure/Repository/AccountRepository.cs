using System;
using Application.DTOs.Request.Account;
using Application.DTOs.Response;
using Application.DTOs.Response.Account;
using Application.IRepository;
using Domain.Entity.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Repository
{
    public class AccountRepository(
        RoleManager<IdentityRole> roleManager,
        UserManager<ApplicationUser> userManager,
        IConfiguration configuration,
        SignInManager<ApplicationUser> signInManager
    ) : IAccount
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

        public Task<IEnumerable<GetRoleDTO>> GetRoleAsynce()
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
    }
}
