using Application.DTOs.Request.Account;
using Application.DTOs.Response;
using Application.DTOs.Response.Account;
using Application.IRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("AllowSpecificOrigins")]
    [Authorize]  // Require authentication by default
    public class AccountController(IAccount account) : ControllerBase
    {
        [AllowAnonymous]  // Allow anonymous access for registration
        [HttpPost("identity/create")]
        public async Task<ActionResult<GeneralResponse>> CreateAccount(CreateAccountDTO model)
        {
            if (!ModelState.IsValid)
                return BadRequest("Model Cannot be Null");
            return Ok(await account.CreateAccountAsync(model));
        }

        [AllowAnonymous]  // Allow anonymous access for login
        [HttpPost("identity/login")]
        public async Task<ActionResult<LoginResponse>> Login(LoginDTO model)
        {
            if (!ModelState.IsValid)
                return BadRequest("Model Cannot be Null");
            return Ok(await account.LoginAsync(model));
        }

        [AllowAnonymous]  // Allow anonymous access for refresh token
        [HttpPost("identity/refresh-token")]
        public async Task<ActionResult<GeneralResponse>> RefreshToken(RefreshTokenDTO model)
        {
            if (!ModelState.IsValid)
                return BadRequest("Model Cannot be Null");
            return Ok(await account.RefreshTokenAsync(model));
        }

        [Authorize(Roles = "Admin")]  // Only admin can create roles
        [HttpPost("identity/role/create")]
        public async Task<ActionResult<GeneralResponse>> CreateRole(CreateRoleDTO model)
        {
            if (!ModelState.IsValid)
                return BadRequest("Model Cannot be Null");
            return Ok(await account.CreateRoleAsync(model));
        }

        [Authorize(Roles = "Admin")]  // Only admin can list roles
        [HttpPost("identity/role/list")]
        public async Task<ActionResult<IEnumerable<GetRoleDTO>>> GetRoles() =>
            Ok(await account.GetRoleAsync());

        [Authorize(Roles = "Admin")]  // Only admin can create admin
        [HttpPost("identity/admin/create")]
        public async Task<IActionResult> CreateAdminAsync()
        {
            await account.CreateAdmin();
            return Ok();
        }

        [Authorize]  // Require authentication for users with roles
        [HttpPost("identity/users-with-roles")]
        public async Task<ActionResult<IEnumerable<GeneralResponse>>> GetUserWithRoles() =>
            Ok(await account.GetUsersWithRolesResponseAsync());

        [Authorize]  // Require authentication for change user role
        [HttpPost("identity/change-role")]
        public async Task<ActionResult<GeneralResponse>> ChangeUserRole(
            ChangeUserRoleRequest model
        ) => Ok(await account.ChangeUserRoleRequestAsync(model));
    }
}
